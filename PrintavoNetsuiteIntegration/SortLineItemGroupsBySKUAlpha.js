/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/https', 'N/log', 'N/record', 'N/search', 'N/util','N/runtime', 'N/task'], function (https, log, record, search, util,runtime,task) {
    function execute(context) {
        try {
            // Retrieve parameters passed from the User Event Script
            var scriptObj = runtime.getCurrentScript();
            var printavoOrderId = scriptObj.getParameter({ name: 'custscriptprintavo_order_id' });
			
            log.debug("Scheduled Script Running", "Processing order ID: " + printavoOrderId);

            // Simulating heavy processing (e.g., multiple API calls, line item processing)
           var lineItems = fetchPrintavoLineItemGroups(printavoOrderId);
           log.debug("line Items:", lineItems); //Each item is its own line item group
           //testing
           var sortedGroups = sortLineItemGroups(printavoOrderId, groupedItems);
           //might need to track empty groups to delete later.
           log.debug("sorted Groups:",emptyGroups);
            log.debug("Scheduled Script Complete", "For record ID: " + printavoOrderId);
        
            /* var scriptTask = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                scriptId: 'customscriptline_item_groups_scheduled', // Replace with Scheduled Script ID
                params: {
                    'custscriptprintavo_order_id': printavoOrderId
                }
            });

             var taskId = scriptTask.submit();
           log.debug("Scheduled Script Task Submitted", "Task ID: " + taskId);
          */
        
        
        
        } catch (error) {
            log.error("Scheduled Script Error", error);
        }
    }
	
	
	
    function sleep(milliseconds) {
      //Hopefully this works.
        var start = new Date().getTime();
        while (new Date().getTime() < start + milliseconds) {
            // Do nothing (busy wait)
             if (runtime.getCurrentScript().getRemainingUsage() < 100) {
               log.debug("YIELDING");
                   runtime.getCurrentScript().yield();
             } 
        }
    }
    function fetchPrintavoLineItemGroups(orderId) {
      var hadMoreThanAPage = false;
      var exRetArr = [];
      log.debug("Fetching line item groups");
       var url = 'https://www.printavo.com/api/v2';
        var headers = {
            'Content-Type': 'application/json',
            'email': 'zacharyfstthomas@gmail.com',  
            'token': 'a9z2qKFEhW1XOF-e2yIkpA' 
        };
   
        var graphqlQuery = JSON.stringify({
           query: 
           'query { order(id: '+orderId+') { ... on Quote { id nickname lineItemGroups(first: 100) { pageInfo {hasNextPage endCursor} edges { node { id lineItems { edges { node { id description price items itemNumber lineItemGroup {id}}}}}}}}}}'
        });
      log.debug("Posting to get line items:", graphqlQuery);

      var response = https.post({
                url: url,
                 headers: headers,
                body: graphqlQuery
               });
       var responseBody = JSON.parse(response.body);
      log.debug("ResponseBody: ", responseBody);

      var count = 0;
      try{
        if(responseBody.data.order.lineItemGroups.pageInfo.hasNextPage){
      
          //make true deep copy to push into(i actually don't think we need this lol, but makes it look slightly nicer.)
          exRetArr = JSON.parse(JSON.stringify(responseBody.data.order.lineItemGroups.edges));

           var graphqlQueryEx = JSON.stringify({
           query: 
           'query { order(id: '+orderId+') { ... on Quote { id nickname lineItemGroups(first: 100 after: "'+responseBody.data.order.lineItemGroups.pageInfo.endCursor+'") { pageInfo {hasNextPage endCursor} edges { node { id lineItems { edges { node { id description price items itemNumber lineItemGroup {id}}}}}}}}}}'
           });
         while(true){
            
          log.debug("Extra Large Order, working around pagination:", graphqlQueryEx);

          var responseEx = https.post({
                url: url,
                 headers: headers,
                body: graphqlQueryEx
               });
           var responseBodyEx = JSON.parse(responseEx.body);
          log.debug("ResponseBody: ", responseBodyEx);
             //We're gonna do it the slow and easy way. For now
            for(var j =0;j<responseBodyEx.data.order.lineItemGroups.edges.length;j++){
              exRetArr.push(responseBodyEx.data.order.lineItemGroups.edges[j]);
            }
              count++;
           sleep(5000);  
           log.debug("Count of queries:", count);
           if(responseBodyEx.data.order.lineItemGroups.pageInfo.hasNextPage === false) {
             break;
           }
      
           graphqlQueryEx = JSON.stringify({
           query: 
           'query { order(id: '+orderId+') { ... on Quote { id nickname lineItemGroups(first: 100 after: "'+responseBodyEx.data.order.lineItemGroups.pageInfo.endCursor+'") { pageInfo {hasNextPage endCursor} edges { node { id lineItems { edges { node { id description price items itemNumber lineItemGroup {id}}}}}}}}}}'
           });
            
             
           
         }
           return exRetArr;
        }
        
             
        
        
        //else return original
        return responseBody.data.order.lineItemGroups.edges;
         } catch (e){
        //This is just to avoid errors and nonsense with the pagination stuff.
          return responseBody.data.order.lineItemGroups.edges;
         }
      }



  
  function sortLineItemGroups(orderId, lineItemGroups) {

    var returnArrayOfEmpty = [];
    var url = 'https://www.printavo.com/api/v2';
        var headers = {
            'Content-Type': 'application/json',
            'email': 'zacharyfstthomas@gmail.com',  
            'token': 'a9z2qKFEhW1XOF-e2yIkpA' 
        };

    // Convert groupedItems into the correct GraphQL format
  //  var lineItemsToSendArray = [];
    var lineItemGroupToUse = 0;
    for (var lineItemGroup in lineItemGroups) { //For every line item group (mag,tag,pin,ect...)
        log.debug("current line item group:", lineItemGroup);
        log.debug("This should show all items in the line item group:", lineItemGroups[lineItemGroup]);
            
        lineItemGroups[lineItemGroup] = alphaSortALineItemGroup(lineItemGroups[lineItemGroup]);  
     }
    
        log.debug('Printavo Groups Sorted');
        return returnArrayOfEmpty;
   }  
   
   function alphaSortALineItemGroup(lineItemGroup) {
    /*
    var count = 0; //cant use i because groupedItems array can be long but groupedItems[itemClass] can be small
    for(var i=0;i<lineItemGroup.length;i++){
      //Going to send all the lineItems into the lineItemGroup of the first one.

      /// SLEEP LOOP 
      //This is to ensure we don't hit rate limits
      if(count%8 === 0){
        //Before 10 in a row, Sleep for 5 seconds
        log.debug("Rate limit (10 calls every 5 seconds) might be hit, pausing to avoid rate limit");
        sleep(5000);//5 second delay, sorry for not making it a constant.

        //Check to see if we need to yeild for Netsuite
         if (runtime.getCurrentScript().getRemainingUsage() < 100) {
               log.debug("YIELDING");
               runtime.getCurrentScript().yield();
         } 
      }
 
      
       //Add the lineitemGroup we're about to empty to ones to delete later
      log.debug("Val we're adding to our array:", groupedItems[itemClass][i].lineItemGroup.id);
      returnArrayOfEmpty.push(groupedItems[itemClass][i].lineItemGroup.id) //This is used internally, so need to make it a struct (???)
      log.debug("Current array to return: ", returnArrayOfEmpty);
      
      //Make sure this formatting matches what is required.
       // Updating the line items, one at a time.
        var graphqlQuery = JSON.stringify({             //This line item's ID                                                   //LineItemGroup we're using (first in this Class)
           query: 'mutation { lineItemUpdate(id: '+.id+', input: { position: +posToSet+ lineItemGroup: {id: '+lineItemGroupToUse+'}  })   { id description price itemNumber items lineItemGroup {id} }}'
        }); 
        log.debug("Query to send:", graphqlQuery);
        var response = https.post({
               url: url,
               headers: headers,
               body: graphqlQuery
           });
        var responseBody = JSON.parse(response.body);
       log.debug("ResponseBody:",responseBody);
      count++;
    }
   */

   }


    return { execute: execute };
});

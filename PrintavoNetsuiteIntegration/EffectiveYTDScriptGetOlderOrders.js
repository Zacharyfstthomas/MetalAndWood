/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/https', 'N/record', 'N/log', 'N/search','N/runtime','N/task'], (https, record, log, search,runtime,task) => {
    // Constants for Printavo API
    const PRINTAVO_API_URL = 'https://www.printavo.com/api/v1/orders?email=zacharyfstthomas@gmail.com&token=a9z2qKFEhW1XOF-e2yIkpA&per_page=50';
    const PRINTAVO_API_KEY = 'a9z2qKFEhW1XOF-e2yIkpA' ;
    var invoicesProcessed = 0;
   headers = {
        'Content-Type': 'application/json', 
        'email': 'zacharyfstthomas@gmail.com', // Replace with your Printavo email
        'token': 'a9z2qKFEhW1XOF-e2yIkpA' // Replace with your API token
    };
  
    // Fetch shipped orders from Printavo
    const fetchShippedOrders = (page) => {
        try {
            var perPageUrl = PRINTAVO_API_URL + '&page='+page;
          
            const response = https.request({
                method: https.Method.GET,
                url: perPageUrl, //need to specify just shipped orders
                headers: headers
            });

            const responseBody = JSON.parse(response.body);

            if (response.code === 200) {
                return responseBody;
            } else {
                log.error('Error fetching orders from Printavo', response.body);
                throw new Error(`Failed to fetch orders: ${response.body}`);
            }
        } catch (error) {
            log.error('Error in fetchShippedOrders', error.message);
            throw error;
        }
    };

         function createNonInventoryItem(sku, price, amount, description) {
        try {
            var item = record.create({
                type: record.Type.NON_INVENTORY_ITEM,
                isDynamic: false
            });
            item.setValue({ fieldId: 'itemid', value: sku }); //These will end up being overwritten. Will likely remove for only mandatory items.
           log.debug("itemid:", sku);
         item.setValue({ fieldId: 'displayname', value: sku }); // Add this
          item.setValue({ fieldId: 'language', value: 'en_US' });
          try {
            item.getField('forResale');
            log.debug("Has field forResale");
            item.setValue({ fieldId: 'forResale', value: true });
          } catch (e){
            
          }
           
            item.setValue({ fieldId: 'incomeaccount', value: 54 });
        
           try {
            item.getField('subtype');
            log.debug("Has field subtype");
            item.setValue({ fieldId: 'subtype', value: 'resale' });
          } catch (e){
            
          }
         // item.setValue({ fieldId: 'expenseaccount', value: 58})
          item.setValue({ fieldId: 'taxschedule', value: 1 });
          item.setValue({ fieldId: 'taxSchedule', value: 1 });
          item.setValue({ fieldId: 'TaxSchedule', value: 1 });
         //Maybe necessary, but i dont think we're international.
          // item.setValue({ fieldId: 'salesTaxCode', value: 1 });
          item.setValue({ fieldId: 'costcategory', value: 1}); //default
          item.setValue({ fieldId: 'overheadtype', value: 2 });//default value: "Fixed Overhead"
          item.setValue({ fieldId: 'revrecforecastrule', value: '' }); //Not using this value at all, but record browser says its required
          item.setValue({ fieldId: 'rate', value: price });
          item.setValue({ fieldId: 'amount', value: amount });
          item.setValue({ fieldId: 'description', value: description });
          item.setValue({ fieldId: 'salesdescription', value: description });
          item.setValue({ fieldId: 'ignoreMinQtyCheck', value: true });
          item.setValue({ fieldId: 'mandatorytaxcode', value: "-Not Taxable-" });
            var itemId = item.save({    ignoreMandatoryFields: false });
            return itemId;
        } catch (e) {
            log.error({ 
            title: 'Error Creating Item', 
            details: e.message + ' | Stack: ' + e.stack 
        });
            return null;
        }
    }
  
      function searchInvoicesByMemo(memoValue) {
        //Updated way to search invoice. Search by value in memo (Prinavo Order ID)
        var invoiceSearch = search.create({
            type: search.Type.INVOICE,
            filters: [
                ['memo', 'contains', memoValue]
            ],
            columns: ['tranid', 'entity', 'memo', 'amount']
        });

        var result = invoiceSearch.run().getRange({ start: 0, end: 1 })
        return result.length > 0;
    }
  
    ///Checking if an invoice already exists,so as to not create duplicates
     const hasInvoice = (salesOrderId) => {
         try {
			 
            var invoiceSearch = search.create({
               type: search.Type.INVOICE,
               filters: [
                   ['createdfrom', 'anyof', salesOrderId] // Checks if an Invoice exists for this Sales Order
               ],
               columns: ['internalid']
          });
 
          var result = invoiceSearch.run().getRange({ start: 0, end: 1 });
          return result.length > 0; // Returns true if at least one invoice exists
        } catch (error) {
            log.error("Error checking invoice existence", error);
            return false; // Default to false in case of an error
       }
   };

     const hasInvoiceVisualId = (specificTranId) => {
         try { 
          var invoiceSearch = search.create({
               type: search.Type.INVOICE,
               filters: [
                  ['tranid', 'is', specificTranId]
               ],
               columns: ['tranid']
          });
 
          var result = invoiceSearch.run().getRange({ start: 0, end: 1 });
          return result.length > 0; // Returns true if at least one invoice exists
        } catch (error) {
            log.error("Error checking invoice existence", error);
            return false; // Default to false in case of an error
       }
   };

  function loadSalesOrderByTranid(tranidValue) {
  // Step 1: Search for the record by tranid
  const salesOrderSearch = search.create({
    type: search.Type.SALES_ORDER,
    filters: [['tranid', 'is', tranidValue]],
    columns: ['internalid']
  });

  const result = salesOrderSearch.run().getRange({ start: 0, end: 1 });
      if (result.length === 0) {
        throw new Error('Sales Order not found with tranid: ' + tranidValue);
      }
      if(result.length > 1){
        log.debug("Critical issue. More than one invoice with the same document number. This shouldn't be the case....");
        for(var i=0;i<result.length;i++){
           log.audit("Sales order " +i+ " with "+tranidValue+" as doc number:", result[i].getValue('internalid'));
         }
        //log.debug("") Return first for now
        return result[0].getValue('internalid');
      }
      
       log.debug("Current internal id:", result[0].getValue('internalid'));
      return result[0].getValue('internalid');
   
      
  }

  
    function rescheduleScript() {
        var scriptTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
        scriptTask.scriptId = runtime.getCurrentScript().id;
        scriptTask.submit();
    }
  
  function getMinimumQuantity(itemId) {
       var itemData = search.lookupFields({
            type: search.Type.ITEM,
            id: itemId,
            columns: ['minimumquantity']
           });
       
    try{
      return itemData.minimumquantity || 0;
    }catch (err){
       return 0;
      }
    }
    // Create invoice in NetSuite
    const processOrder = (order) => {
		
		//Mapping: 
		//id
		//production_notes + notes
		//NOTE: SOME ORDERS THAT WERE BROUGHT OVER ARE MISSING ITEMS THAT WERE ON PRINTAVO,
        //SINCE NETSUITE DID NOT HAVE THEM AS ITEMS.
      
         try {
                var salesOrderId = order.id; //printavo ID, this will work for this script since we're creating these invoices with printavo IDs
                log.debug("Order id: ", order.id);
              
                var now = new Date();
                log.debug("Now: ",now);
                log.debug("createdat formatted: ", order.formatted_custom_created_at_date)
           var createdDate = new Date(order.formatted_custom_created_at_date);
               
                log.debug("Order creation date: ", createdDate);

                var diffInMs = Math.abs(createdDate - now);
                var date_diff = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
                log.debug("Difference in days: ", date_diff);     
               
                if(date_diff >= 0){
				//Many netsuite fields will be blank
                // Transform Sales Order into Invoice 
                  //First, check if invoice already exists (traditonally, and by searching through memo for Printavo order ID)
                  //Not ideal but should work for now.
                    if (hasInvoice(salesOrderId) || searchInvoicesByMemo(order.id) || hasInvoiceVisualId(order.visual_id) || searchInvoicesByMemo(order.visual_id) ) {
                         log.debug("Skipping transformation", "Sales Order " + salesOrderId + " already has an Invoice.");
                    } else {
                             //Check if there is a sales order for this invoice
                             //Simply search sales orders for the document number
                            //If there is no sales order with the document number, then the order has not been entered into netsuite at any point
                             //and we use this script, but otherwise, we can just convert like the other script does.
                            if(searchSalesOrdersByMemo(order.visual_id) || searchSalesOrdersByTranId(order.visual_id)){
                              log.debug("This order exists as a sales order already, converting it to invoice."); 
                              netsuiteSalesOrderId = loadSalesOrderByTranid(order.visual_id);
                             
                              
                              //If this crashes, better than trying to create a duplicate invoice.
                              var invoiceRecord = record.transform({
                                 fromType: record.Type.SALES_ORDER,
                                 fromId: netsuiteSalesOrderId,
                                 toType: record.Type.INVOICE,
                                 isDynamic: true
                                });
                            var memostr = 'Invoice from Printavo Order #' + order.visual_id + "\n" + order.production_notes + "\nOther Notes: " + order.notes;
							invoice.setValue({ fieldId: 'memo', value: memostr.slice(0,990)});
                            // Not using these for right now.
                            // invoice.setValue({ fieldId: 'amountremaining', value: order.amount_outstanding});
                            // invoice.setValue({ fieldId: 'amountpaid', value: order.amount_paid});
                            
                               var invoiceId = invoiceRecord.save();
                               log.debug("Invoice ID :", invoiceId);
                              invoicesProcessed++;
                             return;
                            }
                      
                     //Need to create the invoice in Printavo
                         var invoice = record.create({
							type: record.Type.INVOICE,
							isDynamic: true
						});

						
						//check if customer exists
						var customerSearch = search.create({
							type: search.Type.CUSTOMER,
							filters: [
							['entityid', 'is', order.customer.company.trim()] ,
                              'OR',
                            ['companyname', 'is', order.customer.company.trim()]// Match exact customer name
							],
							columns: ['internalid', 'entityid']
						});
					//search customers and pull first customer id 
					 var customerId = null;
							customerSearch.run().each(function(result) {
							customerId = result.getValue('internalid');
							log.debug('Customer Found', 'ID: ' + customerId + ', Name: ' + result.getValue('entityid'));
						return false; // Stop after the first match
					});
                      log.debug("Customer ID after search:", customerId);
						if(customerId === null){ //if its still null (!customerId is flagging when it shouldnt?), check with first + last name
							log.debug("Moving to searching for name");
                            var searchName = order.customer.full_name
							var customerSearchSecond = search.create({
								type: search.Type.CUSTOMER,
								filters: [
									['entityid', 'contains', searchName] // Match full name
								],
								columns: ['internalid', 'entityid']
							});
					      //search customers and pull first customer id 
						var customerId = null;
								customerSearchSecond.run().each(function(result) {
								customerId = result.getValue('internalid');
								log.debug('Customer Found', 'ID: ' + customerId + ', Name: ' + result.getValue('entityid'));
							return false; // Stop after the first match
								});
					  log.debug("Customer ID after search:", customerId);		
						}
						if(customerId){

                          
                            log.debug("Filling out invoice");
                            invoice.setValue({ fieldId: 'internalid', value: order.id }); // Internal order ID
					        invoice.setValue({ fieldId: 'tranid', value: order.visual_id }); // Thsis the Visual ID
                            invoice.setValue({ fieldId: 'entity', value: customerId }); // Customer Id
							invoice.setValue({fieldId: 'otherrefnum', value: order.visual_po_number});
 							invoice.setValue({ fieldId: 'trandate', value: new Date() }); // Invoice Date
                           //NOT USING for rn invoice.setValue({ filedId: 'amountremaining', value: order.amount_outstanding});
                           //NOT USING for rn invoice.setValue({ filedId: 'amountpaid', value: order.amount_paid});
                            var memostr = 'Invoice from Printavo Order #' + order.visual_id + "\n" + order.production_notes + "\nOther Notes: " + order.notes;
							invoice.setValue({ fieldId: 'memo', value: memostr.slice(0,990)});
		                    invoice.setValue({ fieldId: '', value: order.total})
							//Bad way of adding billing and shipping addr to Invoice
							printavoBillAddr = "";
							if(order.order_addresses_attributes[0]){
							printavoBillAddr = order.order_addresses_attributes[0].company_name + "\n" + order.order_addresses_attributes[0].address1 + "\n" + order.order_addresses_attributes[0].address2 + "\n" + order.order_addresses_attributes[0].city + " " + order.order_addresses_attributes[0].state_iso + " " + order.order_addresses_attributes[0].zip + "\n" + order.order_addresses_attributes[0].country;
							}
							invoice.setValue({ fieldId: 'billingaddress_text', value: printavoBillAddr });
							//Same with shipping
							printavoShipAddr = "";
							if(order.order_addresses_attributes[1]){
							printavoShipAddr = order.order_addresses_attributes[1].company_name + "\n" + order.order_addresses_attributes[1].address1 + "\n" + order.order_addresses_attributes[1].address2 + "\n" + order.order_addresses_attributes[1].city + " " + order.order_addresses_attributes[1].state_iso + " " + order.order_addresses_attributes[1].zip + "\n" + order.order_addresses_attributes[1].country;
							invoice.setValue({ fieldId: 'shippingaddress_text', value: printavoShipAddr });
							}
                            
                              for(var k = 0; k < order_fees_attributes.length;k++){
                                if(order_fees_attributes[k].description.trim() === "Shipping Charges" || order_fees_attributes[k].description.trim() === "Shipping Fee" || order_fees_attributes[k].description.trim() === "Shipping Fees" || order_fees_attributes[k].description.trim() === "Shipping Charge"){
                                     invoice.setValue({fieldId: 'shipmethod', value: 148642}); //overwritable shipping method
                                     invoice.setValue({fieldId: 'shippingcost', value: order.order_fees_attributes[k].amount});  
                                     invoice.setValue({fieldId: 'shippingcostoverridden', value: order.order_fees_attributes[k].amount});
                                     log.debug("Shipping amount:", invoice.getValue("shippingcost"));
                                  }
                              }

                            invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'ignoreMinQtyCheck', value: true });
                            log.debug("Should be ignoring MinQtyCheck");
							
                            // Loop through Printavo order items and add to Invoice
							//Item ID will not to existing netsuite item, Resolve via searching for SKU.
                          
                            var lineItems = order.lineitems_attributes;
				            var atLeastOneItem = false;
							for (var i = 0; i < lineItems.length; i++) {
								netsuiteItemId = null;
								log.debug("Searching item "+ i);
								var itemSearch = search.create({//Previously used item_display
									type: search.Type.ITEM,
									filters: [['itemid', 'is', lineItems[i].style_number]],//Search using printavo sku, which will match netsuite sku
									columns: ['internalid', 'itemid']
								});
								
								itemSearch.run().each(function(result) {//Find each that matches, and get internal id we need
									netsuiteItemId = result.getValue('internalid');
									log.debug('Item Found', 'ID: ' + netsuiteItemId + ', SKU: ' + result.getValue('itemid'));
									return false; // Stop after the first match
								});
                              if(!netsuiteItemId){
                                //Here's where we create a new item
                                log.debug("Item not found in Netsuite. Creating new item for it");
                               try {
                                netsuiteItemId = createNonInventoryItem(lineItems[i].style_number, lineItems[i].unit_cost, (lineItems[i].unit_cost * lineItems[i].total_quantities),lineItems[i].style_description)
                              }  catch (e) {
                                   log.error('Error Creating Item', e.message);
                                 }
                              }

                                      var fieldsSublist = invoice.getSublistFields({ sublistId: 'item' });
                                     // log.debug('Feilds in ITEM Sublist', fieldsSublist);
								
                                    atLeastOneItem = true;
                                    log.debug("Adding item "+ netsuiteItemId);
									invoice.selectNewLine({ sublistId: 'item' });
                                    
									invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: netsuiteItemId }); // Use ID we found
                                    var minQty = getMinimumQuantity(netsuiteItemId); // Custom function to fetch min qty
                                    var quantity = lineItems[i].total_quantities;

                                     if (quantity < minQty) {
                                       //set quantity to min
                                        invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: minQty});
                                     log.debug("Item does not meet minimum quantity", "Using Netsuite minimum for item: " +netsuiteItemId + "Which is: "+ minQty);
                                    } else {
                                invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: quantity});
                                    }
									invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: lineItems[i].unit_cost });
									invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: lineItems[i].style_description });
									invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'itemid', value: lineItems[i].style_number });
                                    var thisItemTotalCost = (lineItems[i].unit_cost * lineItems[i].total_quantities);
									invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: thisItemTotalCost});// Use Amount Outstanding!!!
                                    invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'mandatorytaxcode', value: "-Not Taxable-"});
                                    //invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: "-Not Taxable-"});
                                    invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'ignoreMinQtyCheck', value: true });
                                  
									invoice.commitLine({ sublistId: 'item' });
								
							}
						//Location (of user, not of invoice, not related to billing/shipping)

                          if(atLeastOneItem){

                          var locationSearch = search.create({
                             type: search.Type.LOCATION,
                             columns: ['internalid']
                          }).run().getRange({ start: 0, end: 10 });

                          var locationId = locationSearch.length ? locationSearch[0].getValue('internalid') : null;

                          log.debug('Company Location ID:', locationId);
                          invoice.setValue({ fieldId: 'location', value: locationId }); // CustomerI
               
						   //Saving invoice
							var invoiceId = invoice.save({ enableSourcing: true, ignoreMandatoryFields: false });
							//Ensure the invoice is indexed
							var reloadedInvoice = record.load({
                              type: record.Type.INVOICE,
                              id: invoiceId
                            });
							
							reloadedInvoice.save();
							log.debug("Shipping amount:", reloadedInvoice.getValue("shippingcost"));
							log.debug("Invoice ID :", invoiceId);
                            invoicesProcessed++;
							
							var scriptObj = runtime.getCurrentScript();
 
                            if (scriptObj.getRemainingUsage() < 150) {
                                log.audit('Rescheduling Script', 'Taking a break to avoid governance limits.');
                                 rescheduleScript();
                            }

                          }  else{
                                log.debug("No items found for this order.");
                          }
						
                        } else {
                          log.debug("Customer could not be found in Netsuite. Creating new customer for them");
                           
                            // Create the customer record
                         const customerRecord = record.create({
                             type: record.Type.CUSTOMER,
                             isDynamic: true
                         });
            
                        // Set the company name (or individual's name)
                        customerRecord.setValue({
                          fieldId: 'companyname',
                          value: customerName
                        });
                        
                          const customerId = customerRecord.save();

 
                            log.debug("Filling out invoice");
                            invoice.setValue({ fieldId: 'internalid', value: order.id }); // Internal order ID
					        invoice.setValue({ fieldId: 'tranid', value: order.visual_id }); // Thsis the Visual ID
                            invoice.setValue({ fieldId: 'entity', value: customerId }); // Customer Id
							invoice.setValue({fieldId: 'otherrefnum', value: order.visual_po_number});
 							invoice.setValue({ fieldId: 'trandate', value: new Date() }); // Invoice Date
                           //NOT USING for rn invoice.setValue({ filedId: 'amountremaining', value: order.amount_outstanding});
                           //NOT USING for rn invoice.setValue({ filedId: 'amountpaid', value: order.amount_paid});
                            var memostr = 'Invoice from Printavo Order #' + order.visual_id + "\n" + order.production_notes + "\nOther Notes: " + order.notes;
							invoice.setValue({ fieldId: 'memo', value: memostr.slice(0,990)});
		                    invoice.setValue({ fieldId: '', value: order.total})
							//Bad way of adding billing and shipping addr to Invoice
							printavoBillAddr = "";
							if(order.order_addresses_attributes[0]){
							printavoBillAddr = order.order_addresses_attributes[0].company_name + "\n" + order.order_addresses_attributes[0].address1 + "\n" + order.order_addresses_attributes[0].address2 + "\n" + order.order_addresses_attributes[0].city + " " + order.order_addresses_attributes[0].state_iso + " " + order.order_addresses_attributes[0].zip + "\n" + order.order_addresses_attributes[0].country;
							}
							invoice.setValue({ fieldId: 'billingaddress_text', value: printavoBillAddr });
							//Same with shipping
							printavoShipAddr = "";
							if(order.order_addresses_attributes[1]){
							printavoShipAddr = order.order_addresses_attributes[1].company_name + "\n" + order.order_addresses_attributes[1].address1 + "\n" + order.order_addresses_attributes[1].address2 + "\n" + order.order_addresses_attributes[1].city + " " + order.order_addresses_attributes[1].state_iso + " " + order.order_addresses_attributes[1].zip + "\n" + order.order_addresses_attributes[1].country;
							invoice.setValue({ fieldId: 'shippingaddress_text', value: printavoShipAddr });
							}
                            
                              for(var k = 0; k < order_fees_attributes.length;k++){
                                if(order_fees_attributes[k].description.trim() === "Shipping Charges" || order_fees_attributes[k].description.trim() === "Shipping Fee" || order_fees_attributes[k].description.trim() === "Shipping Fees" || order_fees_attributes[k].description.trim() === "Shipping Charge"){
                                     invoice.setValue({fieldId: 'shipmethod', value: 148642}); //overwritable shipping method
                                     invoice.setValue({fieldId: 'shippingcost', value: order.order_fees_attributes[k].amount});  
                                     invoice.setValue({fieldId: 'shippingcostoverridden', value: order.order_fees_attributes[k].amount});
                                     log.debug("Shipping amount:", invoice.getValue("shippingcost"));
                                  }
                              }

                            invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'ignoreMinQtyCheck', value: true });
                            log.debug("Should be ignoring MinQtyCheck");
							
                            // Loop through Printavo order items and add to Invoice
							//Item ID will not to existing netsuite item, Resolve via searching for SKU.
                          
                            var lineItems = order.lineitems_attributes;
				            var atLeastOneItem = false;
							for (var i = 0; i < lineItems.length; i++) {
								netsuiteItemId = null;
								log.debug("Searching item "+ i);
								var itemSearch = search.create({//Previously used item_display
									type: search.Type.ITEM,
									filters: [['itemid', 'is', lineItems[i].style_number]],//Search using printavo sku, which will match netsuite sku
									columns: ['internalid', 'itemid']
								});
								
								itemSearch.run().each(function(result) {//Find each that matches, and get internal id we need
									netsuiteItemId = result.getValue('internalid');
									log.debug('Item Found', 'ID: ' + netsuiteItemId + ', SKU: ' + result.getValue('itemid'));
									return false; // Stop after the first match
								});
                              if(!netsuiteItemId){
                                //Here's where we create a new item
                                log.debug("Item not found in Netsuite. Creating new item for it");
                               try {
                                netsuiteItemId = createNonInventoryItem(lineItems[i].style_number, lineItems[i].unit_cost, (lineItems[i].unit_cost * lineItems[i].total_quantities),lineItems[i].style_description)
                              }  catch (e) {
                                   log.error('Error Creating Item', e.message);
                                 }
                              }

                                      var fieldsSublist = invoice.getSublistFields({ sublistId: 'item' });
                                     // log.debug('Feilds in ITEM Sublist', fieldsSublist);
								
                                    atLeastOneItem = true;
                                    log.debug("Adding item "+ netsuiteItemId);
									invoice.selectNewLine({ sublistId: 'item' });
                                    
									invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: netsuiteItemId }); // Use ID we found
                                    var minQty = getMinimumQuantity(netsuiteItemId); // Custom function to fetch min qty
                                    var quantity = lineItems[i].total_quantities;

                                     if (quantity < minQty) {
                                       //set quantity to min
                                        invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: minQty});
                                     log.debug("Item does not meet minimum quantity", "Using Netsuite minimum for item: " +netsuiteItemId + "Which is: "+ minQty);
                                    } else {
                                invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: quantity});
                                    }
									invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: lineItems[i].unit_cost });
									invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: lineItems[i].style_description });
									invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'itemid', value: lineItems[i].style_number });
                                    var thisItemTotalCost = (lineItems[i].unit_cost * lineItems[i].total_quantities);
									invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: thisItemTotalCost});// Use Amount Outstanding!!!
                                    invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'mandatorytaxcode', value: "-Not Taxable-"});
                                    //invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: "-Not Taxable-"});
                                    invoice.setCurrentSublistValue({ sublistId: 'item', fieldId: 'ignoreMinQtyCheck', value: true });
                                  
									invoice.commitLine({ sublistId: 'item' });
								
							}
						//Location (of user, not of invoice, not related to billing/shipping)

                          if(atLeastOneItem){

                          var locationSearch = search.create({
                             type: search.Type.LOCATION,
                             columns: ['internalid']
                          }).run().getRange({ start: 0, end: 10 });

                          var locationId = locationSearch.length ? locationSearch[0].getValue('internalid') : null;

                          log.debug('Company Location ID:', locationId);
                          invoice.setValue({ fieldId: 'location', value: locationId }); // CustomerI
               
						   //Saving invoice
							var invoiceId = invoice.save({ enableSourcing: true, ignoreMandatoryFields: false });
							//Ensure the invoice is indexed
							var reloadedInvoice = record.load({
                              type: record.Type.INVOICE,
                              id: invoiceId
                            });
							
							reloadedInvoice.save();
							log.debug("Shipping amount:", reloadedInvoice.getValue("shippingcost"));
							log.debug("Invoice ID :", invoiceId);
                            invoicesProcessed++;
							
							var scriptObj = runtime.getCurrentScript();
 
                            if (scriptObj.getRemainingUsage() < 150) {
                                log.audit('Rescheduling Script', 'Taking a break to avoid governance limits.');
                                 rescheduleScript();
                            }

                          }  else{
                                log.debug("No items found for this order.");
                          }
						
                          
                        }
				   }
                } else { //Either already added or YTD.
                  log.debug("Order is too old, skipping");
                }
            } catch (e) {
                log.error('Error Creating Invoice, moving on to next one', e);
                //context.response.write(JSON.stringify({
                  //  success: false,
                 //   message: e.message
                //}));
            }
    };


    // Execute function
    const execute = (scriptContext) => {
        var page = 1; //change to skip pages first page starts at 1
        var hasMore = true;
        var orderNo = 1;
        while (hasMore) { //add && to change page range
            log.debug("This is page #",page);
            log.audit('Fetching Orders', `Page: ${page}`);
            var response = fetchShippedOrders(page);

            log.audit("Total orders found:", response.data.length);  
            //REMEMBER TO DO after order Shipped
            // Order on Hold (Issue)🚀
            //Order status id: 274879
      
            var shippedOrders = response.data.filter(order => (order.orderstatus.name === "Order Shipped🚀"));
            log.audit('Shipped Orders Found', shippedOrders.length);
               
            if(shippedOrders.length === 0){
              page++;
              continue;//Continue if no shipped orders are found
            }
          //potentially filter here?
            shippedOrders.forEach(order => {
                log.debug("Order to process:",order);
                log.debug("This is order #", orderNo);
                log.debug("This is page #", page);
                log.debug("Order's Customer name:", order.customer.full_name);
                log.debug("Order's Company name:", order.customer.company);
                processOrder(order);
                orderNo = orderNo+1;
            });

            // Check if there are more pages
            hasMore = page < response.meta.total_pages;
            page++;
  
           orderNo = 1
        }

        log.audit('Script Complete', 'All shipped orders processed.');
        log.audit("Invoices created from Printavo orders:", invoicesProcessed);
    };

    return { execute };
});

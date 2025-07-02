/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/https', 'N/record', 'N/log', 'N/search','N/runtime','N/task'], (https, record, log, search,runtime,task) => {
    // Constants for Printavo API
  //  const PRINTAVO_API_URL = 'https://www.printavo.com/api/v1/payments?email=zacharyfstthomas@gmail.com&token=a9z2qKFEhW1XOF-e2yIkpA&per_page=50';
    
    var nextPageCursor = '';
    var hasNextPage = true;
    var invoicesProcessed = 0;
    var invoicesSkipped = 0;
    var invoicesAdded = 0;
    var errorCount = 0;
  
   headers = {
        'Content-Type': 'application/json', 
        'email': 'zacharyfstthomas@gmail.com', 
        'token': 'a9z2qKFEhW1XOF-e2yIkpA' 
    };
  
    // Fetch shipped payments from Printavo
    const fetchShippedpayments = (page) => {
      
          var PRINTAVO_API_QUERY = 'query  { transactions(first: 100 after: "'+nextPageCursor+'") { pageInfo { hasNextPage endCursor } edges { node { ... on Payment { id amount processing description transactionDate timestamps {  createdAt updatedAt } category transactedFor { ... on Invoice { visualId paidInFull  } } }}}}}'
        try {
            var graphqlQuery = JSON.stringify({
           query: PRINTAVO_API_QUERY
            });
           log.debug("graphqlQuery:", graphqlQuery)
            const response = https.request({
                method: https.Method.POST,
                url: 'https://www.printavo.com/api/v2', //need to specify just shipped payments
                headers: headers,
                body: graphqlQuery
            });
           // log.debug("response:", response);
            const responseBody = JSON.parse(response.body);
            log.debug("responseBody:", responseBody);
            hasNextPage = responseBody.data.transactions.pageInfo.hasNextPage;
        
            if (response.code === 200) {
                nextPageCursor = responseBody.data.transactions.pageInfo.endCursor;
                hasNextPage = responseBody.data.transactions.pageInfo.hasNextPage;
                log.debug('Next Page Cursor:', nextPageCursor);
                log.debug('Has Next Page:', hasNextPage);  
                log.debug('Total Payments:', responseBody.data.transactions.edges.length);
                return responseBody;
            } else {
                log.error('Error fetching payments from Printavo', response.body);
                hasNextPage = false;
                throw new Error(`Failed to fetch payments: ${response.body}`);
            }
        } catch (error) {
            log.error('Error in fetchShippedpayments', error.message);
            hasNextPage = false;
            throw error;
        }
    };

    function sleep(milliseconds) {
        var start = new Date().getTime();
        while (new Date().getTime() < start + milliseconds) {
            // Do nothing (busy wait)
             if (runtime.getCurrentScript().getRemainingUsage() < 100) {
                  // runtime.getCurrentScript().yield();
             } 
        }
     }
  
    function GetInvoiceFromDocId(grabbedDocumentId) {
        try { 
            var invoiceSearch = search.create({
                 type: search.Type.INVOICE,
                 filters: [
                    ['tranid', 'is', grabbedDocumentId]
                 ],
                 columns: ['tranid','internalid']
            });
   
            var result = invoiceSearch.run().getRange({ start: 0, end: 1 });
           var trueResult = []
          log.debug('results leng', result.length);
          //Redundant check, but just in case
            if (result.length > 0) {
                if(result[0].getValue('tranid') == grabbedDocumentId){
                //  log.audit("this is a match")
                  trueResult.push(result[0]);
                }
             log.debug("results:", result[0].getValue('tranid'));
                log.debug("specificTranId:", grabbedDocumentId);
            }
            log.debug("invoiceExists returns:", trueResult[0]);
            return trueResult[0]; // Returns true if at least one invoice exists
          } catch (error) {
              log.error("Error checking invoice existence", error);
              return false; // Default to false in case of an error
         }

    }

     function getTodaysDate() {
         var today = new Date();
         var year = today.getFullYear();
         var month = today.getMonth() + 1;
         // Add leading zero if needed
         month = month < 10 ? '0' + month : month;
         var day = today.getDate();
         // Add leading zero if needed
         day = day < 10 ? '0' + day : day;
         // Matching YYYY-MM-DD of Printavo
         return year + '-' + month + '-' + day;
      }
    // Create invoice in NetSuite
    const processpayment = (payment) => {
		
		//Mapping: 
        //Credit Card:
        //Echeck: 
      
         try {
                var printavoPaymentId = payment.id; //printavo ID, this will work for this script since we're creating these invoices with printavo IDs
                log.debug("payment id: ", payment.id);
                var invoiceToAddPayment = GetInvoiceFromDocId(payment.transactedFor.visualId);
                   if (!invoiceToAddPayment) {
                   log.error('Invoice not found for visualId: ' + payment.transactedFor.visualId);
                   return;
                   }
        
                           // Check if this payment already exists on the invoice
                var paymentExists = false;
                var paymentCount = invoiceToAddPayment.getLineCount({
                    sublistId: 'apply' //Should be the sublist for the payments
                  });
        
             // Loop through existing payments to check for the same Printavo ID
               for (var i = 0; i < paymentCount; i++) {
                    try{
                        var existingPaymentId = invoiceToAddPayment.getSublistValue({
                        sublistId: 'payment',
                        fieldId: 'custcol_printavo_payment_id', // Custom field to store Printavo payment ID
                        line: i
                    });
                } catch (e) {
                    log.error('This payment doesnt have printavo field, so will skip', e);
                    continue; // Skip this iteration if there's an error
                }
                if (existingPaymentId === printavoPaymentId) {
                    paymentExists = true;
                    log.debug('Payment already exists on invoice', 'Payment ID: ' + salespaymentId);
                    break;
                }
                if (!paymentExists) {
                    log.debug('Adding new payment to invoice', 'Payment ID: ' + salespaymentId);
                    
                    // Select the apply sublist
                    invoiceToAddPayment.selectNewLine({
                        sublistId: 'apply'
                    });
                    
                    // Set payment details
                    invoiceToAddPayment.setCurrentSublistValue({
                        sublistId: 'apply',
                        fieldId: 'amount', 
                        value: payment.amount
                    });
                    
                    invoiceToAddPayment.setCurrentSublistValue({
                        sublistId: 'apply',
                        fieldId: 'custbodyprintavo_payment_id', 
                        value: printavoPaymentId
                    });
                    
                    invoiceToAddPayment.setCurrentSublistValue({
                        sublistId: 'apply',
                        fieldId: 'applydate', 
                        value: (new Date(payment.transactionDate))
                    });
                    
                    netsuitePaymentMethodId = payment.category === 'CREDIT_CARD' ? 8 : 7; // Internal Netsuite IDs for payment method
                    invoiceToAddPayment.setCurrentSublistValue({
                        sublistId: 'apply',
                        fieldId: 'paymentmethod', 
                        value: netsuitePaymentMethodId
                    });

                    invoiceToAddPayment.setCurrentSublistValue({
                        sublistId: 'apply',
                        fieldId: 'memo', 
                        value: payment.description
                    });

                    // Commit the line
                    invoiceToAddPayment.commitLine({
                        sublistId: 'apply'
                    });
                    
                    // Save the invoice with the new payment
                    var savedId = invoiceToAddPayment.save();
                    
                    log.debug('Successfully added payment to invoice', 'Invoice ID: ' + savedId + ', Payment ID: ' + salespaymentId);
                }        

        }
            } catch (e) {
                log.error('Error Updating Invoice, moving on to next one', e);
                log.error('Error stack:', e.stack);
                errorCount++;
            }
    };

    
    // Execute function
    const execute = (scriptContext) => {
       var page = 1;
       var paymentNo = 1;
        while (hasNextPage) {
           if(page % 15 == 0){
             sleep(5000);
           }
           //add && to change page range
           // log.debug("This is page #",page);
            firstRun = false;
            log.audit('Fetching payments', `Page: ${page}`);
            var response = fetchShippedpayments(page);

            log.audit("Total payments found:", response.data.length);  
            //REMEMBER TO DO after payment Shipped
            // payment on Hold (Issue)🚀
            //payment status id: 274879
            //here payment should be a node
                                                                                                                                                                //payment date is today (format YYYY-MM-DD)  
            var today = getTodaysDate();                                                                                                                        //maybe instead of this we add a check to see if a payment exists in Netsuite already                     
            //var shippedpayments = response.data.transactions.edges.filter(payment => ((payment.category == "CREDIT_CARD" || payment.category == "ECHECK")))//&& payment.transactionDate === today));
            var shippedpayments = [];

            for(var i =0; i<response.data.transactions.edges.length; i++){
             //   log.debug("(response.data.transactions.edges[i].node: ",response.data.transactions.edges[i].node);
               // log.debug("(response.data.transactions.edges[i].node.category: ",response.data.transactions.edges[i].node.category);
                if(response.data.transactions.edges[i].node.category == "CREDIT_CARD" || response.data.transactions.edges[i].node.category == "ECHECK"){
                      shippedpayments.push(response.data.transactions.edges[i].node);
                }
              
            }
          
            log.audit('Card/ACH Payments found:', shippedpayments.length);
               
            if(shippedpayments.length === 0){
              page++;
              continue;//Continue if no shipped payments are found
            }
          //potentially filter here?
          try
          {
            shippedpayments.forEach(payment => {
                log.debug("Payment schema:", payment)
                var scriptObj = runtime.getCurrentScript();
                if (scriptObj.getRemainingUsage() < 50) {
                        log.error('Calling it quits. Total errored payments:', errorCount);
                        log.error("Total invoices updated:", invoicesProcessed);
                        log.debug("This is payment #", paymentNo);
                        log.debug("This is page #", page);
                        page = 9999;
                        hasMore = false;
                        throw new Error('BREAK_LOOP');
                } else {
              
                log.debug("payment to process:",payment);
                //log.debug("This is payment #", paymentNo);
                //log.debug("This is page #", page);
               // log.debug("payment's Customer name:", payment.customer.full_name);
               // log.debug("payment's Company name:", payment.customer.company.trim());
                
           //     log.debug("payment.customer.company.trim(): ", payment.customer.company.trim());
                if(payment.transactedFor && payment.transactedFor.visualId !== ""){
                  log.debug("payment's order id:", payment.transactedFor.visualId);
                  processpayment(payment);
                  paymentNo++;
                  invoicesProcessed++;
               } else {
                  log.error("NO VISUAL ID FOR THIS PAYMENT. SKIPPING");
               //   log.debug("Setting company name to customer name.");
                 // payment.customer.company = payment.customer.full_name.trim();
               //   log.debug("New name: ", payment.customer.company);
               //   processpayment(payment);
                //  paymentNo++;
                 // invoicesProcessed++;
               }
            }
          }); 
          } catch(e){
            if(e.message !== 'BREAK_LOOP'){
              throw e;
            }
            //Do nothing otherwise, since this is intended behavior.
          }
           page ++;
           paymentNo = 1;
        }

        log.audit('Script Complete', 'All shipped payments processed.');
        log.audit("Invoices we looked at:", invoicesProcessed)
        log.audit("Payments added to Invoices:", invoicesAdded);
        log.audit("Invoices we skipped: ", invoicesSkipped);
        log.audit("Total payments we tried to add:", (invoicesProcessed-invoicesSkipped))
    };

    return { execute };
});

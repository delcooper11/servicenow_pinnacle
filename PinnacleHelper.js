// Pinnacle Helper Script Include.  Specific for Cal, but the buildPreOrder function shows what fields we write to in Pinnacle.
// Called from the Workflow on a Catalog Item.

var PinnacleHelper = new Class.create();
PinnacleHelper.prototype = {
   initialize: function (context) {
      if (!context){
         this.context = "PinnacleHelper";
      }
      else {
         this.context = context;
      }
      this.p = new Pinnacle(context);
   },
   
   // Function
   // Description: Used to get a Pinnacle department GUID
   // Usage: var pinnDeptID = new PinnacleHelper().getPinnDepartmentID('JJCNS');
   // Input: 
   //    - string ID of a department, e.g. 'JJCNS'
   // Output: 
   //    - string GUID in Pinnacle, e.g. '1212';
   
   getPinnDepartmentID: function (dID) {
      var dGR = (dID.getDisplayValue && dID.id) ? dID : this._getDeptGR(dID);
      
      /*
      // get the cached value
      if (dGR.u_pinnacle_id){
         return dGR.u_pinnacle_id;
      }
      */
      
      var deptObj = this.p.getRecordByID({svc:"PinnacleDepartment", method: "GET_BY_DEPARTMENT_NUMBER", arg1Name: "DEPARTMENT_NUMBER", arg1Value: dGR.id, node:"DEPARTMENT_O"});

/*      
      var s = new SOAPMessage('PinnacleDepartment', 'GET_BY_DEPARTMENT_NUMBER');
      s.setParameter('DEPARTMENT_NUMBER', dID);
      var response = s.post();
      
      // Note that "//" in XPath searches for the first occurrence of a named node
      var xmldoc = new XMLDocument(response);
      var pinnDeptID = xmldoc.getNodeText("//DEPARTMENT_ID") + '';
      // now that we have it, save it
*/
      //deptObj.DEPARTMENT_ID
      
      dGR.u_pinnacle_id = deptObj.DEPARTMENT_ID;
      dGR.update();
      
      return deptObj.DEPARTMENT_ID;
   },
   
   
   
   // Function 
   // Description: Used to get an existing Pinnacle subscriber or if none exists, create a new one
   // Usage: var pinnSubscriberID = new PinnacleHelper().getPinnSubscriberID(
   //    {type:'Department', 
   //     firstName: 'Optional', 
   //     lastName: 'Infrastructure Services',
   //     userID:'JJCNS', 
   //     deptID: 'JJCNS'});
   // Inputs:
   //    Object:
   //         - type: String. 'Department', 'Other', 'User'
   //         - firstName: String. Optional for Department or Other
   //         - lastName: String. REQUIRED for all
   //         - userID: String. REQUIRED for all. for Dept, this should be ID, user should be LDAP uid
   //         - deptID: String. REQUIRED. Pass in a ServiceNow id, like "JJCNS"
   //         - groupID: String. Optional. Pass in "GL", "IC", or "CA". Defaults to "GL"
   // Output: 
   //    
   
   getPinnSubscriberID: function (subObj){
      if (!subObj || !subObj.type || !subObj.lastName || !subObj.userID || !subObj.deptID){
         logIt("getPinnSubscriberID: getPinnSubscriberID - missing some vital information", this.type);
         JSUtil.logObject(subObj);
         return null;
      }
      
      var existing = this.p.getRecordByID({svc: "PinnacleSubscriber", method:"GET_BY_USER_DEFINED_ID", node:"SUBSCRIBER_O", arg1Value: subObj.userID, arg1Name: "subID"});
      if (existing && existing.SUBSCRIBER_ID){
         return existing.SUBSCRIBER_ID + '';
      }
      
      
      //look up the Pinnacle Group ID
      var groupObj = this.getPinnSubscriberGroupID(subObj.groupID);
      
      // TO DO: Look up Pinnacle GUID for subscriber
      
      var newSubObj = {
         FIRST_NAME : (subObj.type == 'User') ? subObj.firstName : '',
         LAST_NAME :  subObj.lastName + '',
         USER_DEFINED_ID : subObj.userID + '',
         DEPARTMENT_ID : this.getPinnDepartmentID(subObj.deptID) + '',
         /*DEPARTMENT_NUMBER : '', */
         SUBSCRIBER_GROUP_ID : groupObj.groupID + '',
         /* SUBSCRIBER_GROUP_NAME : '', */
         BILLING_CYCLE_ID : groupObj.billCycleID + '',
         /*BILLING_CYCLE_CODE : '',*/
         TITLE : subObj.userID + ''
      };
      
      var newSub = this.p.newRecord({svc:'PinnacleSubscriber', method:'NEW_AND_RETURN', node:'SUBSCRIBER_O', record: newSubObj});
      return newSub.SUBSCRIBER_ID + '';
   },
   
   getSubscriberObjFromLnItm: function (li){
      var gr = new GlideRecord(li.u_subscriber_type);
      if (!gr.get(li.u_subscriber_reference)){
         return '';
      }
      
      // user object
      var subscObj= {};
      subscObj.type = li.u_subscriber_type + '';
      if (subscObj.type == "User" || subscObj.type == "sys_user"){
         if (gr.department.nil()){
            subscObj.deptID = 'JJCNS';
         }
         else {
            subscObj.deptID = gr.department.id + '';
         }
         subscObj.type = "User";
         subscObj.firstName = gr.first_name + '';
         subscObj.lastName = gr.last_name + '';
         subscObj.userID = gr.user_name + '';
         //deptGR = gr.department;
      }
      else if (subscObj.type == "cmn_department"){
         subscObj.lastName = gr.name + '';
         subscObj.userID = gr.id + '';
         subscObj.deptID = gr.id + '';
         subscObj.type = "Department";
         //deptGR = gr;
      
      }
      else {
         subscObj.lastName = gr.u_name + '';
         subscObj.userID = gr.u_id + '';
         subscObj.deptID = gr.u_department.id + '';
         subscObj.type = "Other";
         //deptGR = gr.u_department;
      }
      return subscObj;
   },
   
   
   getSubscriberObj: function (s){
      // subscriber type field
      // user field
      // dept field
      // consumer field
      // dept
      // 
      
      
      if (!s || !s.ritm){
         this._logError("getSubscriberObj called with out a GlideRecord");
         return '';
      }
      // current variables
      if (!s.info){
         s.info = 'variables';
      }
      if (!s.ritm[s.info]){
         this._logError("getSubscriberObj called out a GlideRecord, but it has no available info");
         return '';
      }
      var cv = s.ritm[s.info];
      
      // subscriber type field
      if (!s.sField){
         s.sField = "v_subscriber_type";
      }
      // user reference field
      if (!s.uField){
         s.uField = "v_user";
      }
      // department reference field
      if (!s.dField){
         s.dField = "v_department";
      }
      // consumer reference field
      if (!s.cField){
         s.cField = "v_other";
      }
      
      // user object
      var subscObj= {};
      subscObj.type = cv[sField] + '';
      if (subscObj.type == "User" || subscObj.type == "sys_user"){
         if (cv[uField].department.nil()){
            subscObj.deptID = 'JJCNS';
         }
         else {
            subscObj.deptID = cv[uField].department.id + '';
         }
         subscObj.firstName = cv[uField].first_name + '';
         subscObj.lastName = cv[uField].last_name + '';
         subscObj.userID = cv[uField].user_name + '';
         //deptGR = cv[uField].department;
      }
      else if (subscObj.type == "Department" || subscObj.type == "cmn_department"){
         subscObj.lastName = cv[dField].name + '';
         subscObj.userID = cv[dField].id + '';
         subscObj.deptID = cv[dField].id + '';
         //deptGR = cv[dField];
      
      }
      else {
         subscObj.lastName = cv[cField].u_name + '';
         subscObj.userID = cv[cField].u_id + '';
         subscObj.deptID = cv[cField].u_department.id + '';
         //deptGR = cv[cField].u_department;
      }
      return subscObj;
   },
   
   
   getPinnSubscriberGroupID: function (pinnGroupCode){
      //SUBSCRIBER_GROUP_ID
      if (!pinnGroupCode){
         logIt('getPinnSubscriberGroupID - pinnGroupCode is blank!', this.type);
         pinnGroupCode = "GL";
      }
      
      var subscrObj = this.p.getRecordByID({svc:"PinnacleSubscriberGroup", method: "GET_BY_SUBSCRIBER_GROUP_CODE", arg1Name: "groupCode", arg1Value: pinnGroupCode, node:"SUBSCRIBER_GROUP_O"});
      
/*
      var s = new SOAPMessage('PinnacleSubscriberGroup', 'GET_BY_SUBSCRIBER_GROUP_CODE');
      s.setParameter('groupCode', pinnGroupCode);
      var response = s.post();
      
      // Note that "//" in XPath searches for the first occurrence of a named node
      var xmldoc = new XMLDocument(response);
*/
      var pinnGroupID = subscrObj.SUBSCRIBER_GROUP_ID;
      var pinnBillCycleID = subscrObj.BILLING_CYCLE_ID;
      
      return {groupID: pinnGroupID, billCycleID: pinnBillCycleID};
   },
   
   
   // internal function. returns GlideRecord of given department
   _getDeptGR: function (id){
      var d = new GlideRecord('cmn_department');
      if (d.get('id', id)){
         return d;
      }
      else {
         return null;
      }
   },
   
   // given a work order type, gets the Pinnacle labor code
   getAssignedLaborCode: function (workOrderType){
      var gr = new GlideRecord('u_ist_maint_pinn_labor_code');
      gr.addActiveQuery();
      gr.addQuery('u_work_order_type', workOrderType);
      gr.query();
      if (gr.next()){
         return gr.u_labor_code;
      }
      return this.getAssignedLaborCode("Default");
   },
   
   
/*
//u_cmn_location_building.do?sys_id=69d7f87081a86000c54130254285bd86
   var b = new GlideRecord('u_cmn_location_building');
   b.get('69d7f87081a86000c54130254285bd86');
   var bldgID = new PinnacleHelper().getLocationID(b, "Valor's room 2");
   gs.print(bldgID);
   // creates a new location entry in Pinnacle and returns the ID:
*/
   getLocationID: function (bldgGR /* Building GlideRecord */, room){
   /*
      // Required PinnacleLocation elements:
      BUILDING_CODE (BUILDING_ID)
      ROOM_NAME
   */
      
      var bldg = {};
      bldg.BUILDING_CODE = bldgGR.u_code + '';
      bldg.ROOM_NAME = room + '';
      
// not sure if we need this, but leaving in.. 
/*
      var deptRec = this.p.findAndGet({
         svc: "PinnacleLocation", 
         method:"GET_BY_FIELDS",  
         node:"LOCATIONS", 
         query: [{field:"BUILDING_CODE", operation:"=", value:bldg.BUILDING_CODE}, 
            {field:"ROOM_NAME", value:bldg.ROOM_NAME}]
      });
*/      
      
      
      //JSUtil.logObject(bldg);
      var nl = this.p.newRecord({svc: "PinnacleLocation", node:"LOCATION_O", record: bldg});
      if (nl && nl.LOCATION_ID){
         return nl.LOCATION_ID;
      }
      this._logError('pinnacle.integration.error', current, "PinnacleHelper().getLocationID() failed to create a new location record. Check the ECC Queue for details");
      return;
   },
   
/*
// test script:
var pinnCSID = new PinnacleHelper('Background Script').getChartStringID('1-19900-26375-72', 'JJCNS');
gs.print("Pinnacle Account ID: " + pinnCSID);

*/
   
   getChartStringID: function (cs, deptFromOrgCode) {
      logIt('UN formatted ChartString: ' + cs, "PinnacleHelper");
// have 156130199002637572  -- want 1-19900-26375-72
      if (!cs || cs == "undefined" || cs == "null" || cs == ''){
         return '';
      }
      var fcs = new FormatChartString({COA: cs + ''}); // need a method to pass and return straight text
      var csf = fcs.getFormattedPIN();
      var orgCode = fcs.getOrg(); // need the org code to look up the associated department - when creating new Pinnacle Accounts
      if (!csf){
         this._logError("getChartStringID() called without a chartstring");
         return;
      }
      logIt('formatted ChartString: ' + csf, "PinnacleHelper");
      logIt('orgCode: ' + orgCode, "PinnacleHelper");
      //for testing, allow passing of a deptGR
      if (!deptFromOrgCode){
         deptFromOrgCode = this.getDeptFromOrgCode(orgCode);
      }
      var existing = this.p.getRecordByID({svc: "PinnacleAccount", method:"GET_BY_ACCOUNT_NUMBER", node:"ACCOUNT_O", arg1Value: csf});
      if (existing && existing.ACCOUNT_ID){
         logIt('Valid chartstring: ' + existing.ACCOUNT_NUMBER, "PinnnacleHelper");
         return existing.ACCOUNT_NUMBER;
      }
      
      // if we have a string dept ID, get the GlideRecord
      // two assumptions: 1. the getDisplayValue method exists on a GR
      // 2. if it's not a GR already, it's a string Dept ID.
      if (!deptFromOrgCode.getDisplayValue){
         deptFromOrgCode = this._getDeptGR(deptFromOrgCode.id);
         if (!deptFromOrgCode){
            this._logError("PinnacleHelper().getChartStringID() could not get a department ID and Description");
         }
      }
            
      var csRec = {};
      csRec.ACCOUNT_NUMBER  = csf + '';
      csRec.ACCOUNT_NAME    = deptFromOrgCode.name + '';
      csRec.ADD_INFO_TEXT_1 = deptFromOrgCode.id + '';
      var newChartString = this.p.newRecord({svc: "PinnacleAccount", node: "ACCOUNT_O", record: csRec});
      
      if (newChartString && newChartString.ACCOUNT_ID){
         logIt('New, Valid chartstring: ' + newChartString.ACCOUNT_NUMBER, "PinnnacleHelper");
         return newChartString.ACCOUNT_NUMBER;
      }
      
      this._logError("PinnacleHelper().getChartStringID() did not get the expected response from Pinnacle upon account creation. Check the ECC queue for details.");
      return;
   },
   
   getDeptFromOrgCode: function (orgCode){
      var gr = new GlideRecord('u_org_dept');
      if (gr.get('u_org', orgCode)){
         return gr.u_department;
      }
   },
/*
   // Function buildPreOrder
   // Description: Creates a JS Object with all the required fields for Pinnicle
   // Usage:   var uid = new PinnacleHelper().buildPreOrder({
   //             sub: pinnSubscriberID, 
   //             rCS: pinnRecurringCS, 
   //             oCS: pinnOneTimeCS, 
   //             pinnDept: pinnDepartmentID,
   //             dept: current.variables.v_dept, 
   //             ritm: current, 
   //             svc: current.variables.v_phone_model
   //          });
   // Inputs: 
   //    userSysID - OPTIONAL. defaults to logged in user
   // Outputs: 
   //    String value of user_name (LDAP uid)
*/   // {sub: pinnSubscriberID, rCS: pinnRecurringCS, oCS: pinnOneTimeCS, pinnDept: pinnDepartmentID,
   //  dept: current.variables.v_dept, ritm: current, svc: current.variables.v_phone_model}
   buildPreOrder: function (po){
      if (!po || !po.sub || !po.rCS || !po.oCS || !po.dept || !po.inc || !po.svc){
         this._logError("buildPreOrder called without a required input");
      }
      //logIt("dept.id: " + po.dept.id + " 
      var ph = new PinnacleHelper(this.context + " buildPreOrder()");
      if (!po.deptID){
         po.deptID = ph.getPinnDepartmentID(po.dept.id);
      }
      
      logIt('unformatted chartstrings. recurring: ' + po.rCS + ' onetime: ' + po.oCS);
      
      po.rCS = this.getChartStringID(po.rCS);
      po.oCS = this.getChartStringID(po.oCS);
      logIt('new, formatted chartstrings. recurring: ' + po.rCS + ' onetime: ' + po.oCS);
      
      
      /* make these var references */
      if (po.ritm.variables.v_building || po.ritm.variables.v_room){
         po.locID = ph.getLocationID(po.ritm.variables.v_building, po.ritm.variables.v_room);
      }
      else {
         po.locID = '';
      }

// Note:  The fields must be in alphabetical order
// -DC      var comment = this._buildCommentText("Item ordered: " + po.ritm.cat_item.getDisplayValue(), "\nSummary:", new CatalogSummarizer().summRitm(po.ritm));
      
      // Pinnacle will only store the first 2000 characters. 
// **** TO DO: finish this code, truncate at 2000, figure out how to create additional note entries in Pinnacle.
      if (comment.length > 2000){
         // for every block of 500 add'l chars, make a new "note"
         // do the "note"ing here, before truncation
         
         comment = comment.substring(0, 2000);
      }
      
      
      var preOrder = {
         ACTION_CODE: po.ritm.cat_item.u_pinnacle_action + '',
         COMMENT_TEXT: comment, // comments
         DEFAULT_ONE_TIME_EXPENSE_ACCT: po.oCS + '', 
         DEFAULT_RECURRING_EXPENSE_ACCT: po.rCS + '',
         DEPARTMENT_ID: po.deptID + '',
         NEW_SVC_LOC_ID: po.locID + '',
         STATUS_CODE: '0',
         SUBSCRIBER_ID: po.sub + '',
         WORK_STATUS_ID: '2',
         WO_TYPE_CATEGORY_ID: '0',
         WO_TYPE_CODE: po.ritm.cat_item.u_pinnacle_service_type.u_work_order_type + ''
      };   
      return preOrder;
   },
   
   _buildCommentText: function () {
      var retStr = '';
      for (var i=0; i< arguments.length; i++){
         retStr += arguments[i] + '\n';
      }
      
      retStr = retStr.replaceAll('\n', gs.getProperty('pinnacle.line_feed') + '');
      return retStr;
   },
   
   getBundleMRCs: function (svcGR){
      if (!svcGR.getDisplayValue){
         svcGR1 = new GlideRecord('incident');
         if (!svcGR1.get('u_code', svcGR)){
            this._logError("getItemMRCs called, but couldn't find an IST Service Catalog record");
            return '';
         }
         else {
            svcGR = svcGR1;
         }
      }
      
      var bndlArray = [];
      if (svcGR.u_bundle_items.nil()){
         return bndlArray;
      }
      
      var ist = new GlideRecord("incident");
      ist.addQuery('sys_id', 'IN', svcGR.u_bundle_items);
      ist.query();
      while (ist.next()){
         bndlArray.push(ist.u_code + '');
      }
      return bndlArray;
   },
   
   // *** Valor to make the args OOP ***
   buildMRC: function (svcCode, poID, subID, qty){
      if (!svcCode || !poID || !subID){
         this._logError("buildMRC called without required inputs");
      }
      var RECURRING_CHARGE_API_V = {};
      RECURRING_CHARGE_API_V.CHARGE_CODE = svcCode;
      RECURRING_CHARGE_API_V.QUANTITY = (qty && qty > 0) ? qty: 1;
      RECURRING_CHARGE_API_V.WO_ID = poID;
      RECURRING_CHARGE_API_V.SUBSCRIBER_ID = subID;
      return RECURRING_CHARGE_API_V;
   
   },
   
/*
   // Function getEmployeeID
   // Description: gets a given user's user_name (LDAP uid), or the logged in user
   // Usage: var uid = new PinnacleHelper().getEmployeeID();
   // Inputs: 
   //    userSysID - OPTIONAL. defaults to logged in user
   // Outputs: 
   //    String value of user_name (LDAP uid)
*/
   
   getEmployeeID: function (usr) {
      var u = new GlideRecord('sys_user');
      if (usr && u.get(usr)){
         return u.user_name + '';
      }
      u.get(gs.getUserID());
      return u.user_name + '';
   },
   
   _logError: function (message){
      
      logIt(this.context + " encountered an error: " + message, this.type);
      gs.eventQueue('pinnacle.integration.error', current, this.context + ": " + message, this.type);
   },
   
   
   type: "PinnacleHelper"
};
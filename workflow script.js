// Workflow script

// Use this for testing only

var current = new GlideRecord('incident');
current.get('number', 'INC0012377');

// set up variables for easy access
var p = new Pinnacle();
var ph = new PinnacleHelper();
var actionCode = 'u_action_code';
var contactID = 'caller_id';
var contactPhone = 'u_contact_number';
var deptNumber = 'u_department_number';
var servLoc = 'u_location_of_service';
var monthlyRecurring = 'u_cost_center';
var newService = 'u_phone_number_receiving_servi';
var oneTimeCharge = 'u_cost_center';
var priority = 'priority';
var workStatus = 'state';

var commentText = (current.number + '. ' + current.catagory + '. ' + current.subcategory + '. ' + current.short_description + '. ' + current.comments + '. ' + current.work_notes)

var actionName = current.u_action_code + '';

switch(actionName){
	case '1':
		actionName = 'Add';
	break;
	case '2':
		actionName = 'Change';
	break;
	case '3':
		actionName = 'Disconnect';
	break;
	case '4':
		actionName = 'Swap';
	break;
	case '0':
		actionName = 'Move';
	break;
}


// this is now (po)
var preOrderObj = new PinnacleHelper().buildPreOrder({
   actC: current.variables[actionCode], 
   actN: actionName,
   cN: current.variables[contactID],
   comment: commentText,
   cP: current.variables[contactPhone],
   deptID: current.variables[deptNumber],
   inc: current,
   loc: current.variables[servLoc],
   mRC: current.variables[monthlyRecurring],
   newS: current.variables[newService],
   oCS: current.variables[oneTimeCharge],
   pri: current.variables[priority],
   wS: current.variables[workStatus]
});

var preOrder = p.NewRecord({svc:'PinnaclePreOrder', method:'NEW', node:'PRE_ORDER_O', record: preOrderObj});

var s = new SOAPMessage('PinnaclePreOrder', 'NEW');
s.setParameter('RECORD_XML', preOrder);
var response = s.post();
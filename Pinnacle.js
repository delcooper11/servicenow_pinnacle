// JavaScript Document
               gs.include("PrototypeServer");
var Pinnacle = Class.create();
Pinnacle.prototype = {
initialize : function() {
},

ServList : function() {
//Get Service List for current user
// Get employee id of current user
var empid=gs.getUser().getDisplayName().match(/\d\d\d\d\d\d/) ;
var empid=empid+'';

//get service data from pinnacle
var s = new SOAPMessage('PinnacleServiceInfo', 'GET_BY_EMPID');
s.setXMLParameter('EMPID', empid);
var response = s.post();

//convert web service data to an object
var xmldoc = new XMLDocument(response);
var helper = new XMLHelper(xmldoc);
var obj = helper.toObject();

//Parse object into array (object)
var row=0;
var services= {};
services[row]={};
// get list of fields
var nodelist = xmldoc.getNodes("//SERV_INFO_O/*");
var elms=nodelist.getLength();
// iterate through list, change row after last field which is always user_defined_id
for (var i = 0;i<elms;i++) {
var nname=nodelist.item(i).getNodeName();
var nval=nodelist.item(i).getLastChild().getNodeValue();
services[row][nname]=nval;
if (nname=='USER_DEFINED_ID') {
row = row+1 ;
if ( nodelist.item(i+1)) {
services[row]=new Array();
}
}
}

return services;

},
UIServList : function() {
//Get Service List for current user
// Get employee id of current user
var empid=gs.getUser().getDisplayName().match(/\d\d\d\d\d\d/) ;
var empid=empid+'';

//get service data from pinnacle
var s = new SOAPMessage('PinnacleServiceInfo', 'GET_BY_EMPID');
s.setXMLParameter('EMPID', empid);
var response = s.post();

//convert web service data to an object
var xmldoc = new XMLDocument(response);
var helper = new XMLHelper(xmldoc);
var obj = helper.toObject();

//Parse object into array (object)
var row=0;
var services= {};
services[row]={};
// get list of fields
var nodelist = xmldoc.getNodes("//SERV_INFO_O/*");
var elms=nodelist.getLength();
// iterate through list, change row after last field which is always user_defined_id
for (var i = 0;i<elms;i++) {
var nname=nodelist.item(i).getNodeName();
var nval=nodelist.item(i).getLastChild().getNodeValue();
services[row][nname]=nval;
if (nname=='USER_DEFINED_ID') {
row = row+1 ;
if ( nodelist.item(i+1)) {
services[row]=new Array();
}
}
}

return services;

},
getEmpId : function() {
//Get Service List for current user
// Get employee id of current user
var empid=gs.getUser().getDisplayName().match(/\d\d\d\d\d\d/) ;
empid=empid+'';
return this.empid;
},
test : function() {
var a='test';
return a;
},
//Get single record xml response and return record array

GetRecord : function(webservice,webfunction,nodename,recid) {
//gs.include('Pinnacle');
//q=new Pinnacle();
var s = new SOAPMessage(webservice, webfunction);
s.setXMLParameter('arg1', recid);
var response = s.post();
//gs.log(response);
//convert web service data to an xml object
var xmldoc = new XMLDocument(response);
var nodelist = xmldoc.getNodes("//"+nodename+"/*");
var elms=nodelist.getLength();
var record={};
for (var i = 0;i<elms;i++) {
var nname=nodelist.item(i).getNodeName();
if (nodelist.item(i).getLastChild() ) {
  var nval=nodelist.item(i).getLastChild().getNodeValue(); 
  }
  else {
  nval='';
}
  //record[nname]=q.unescapexml(nval);
  record[nname]=nval;
  }
return record;
},
GetRecord2 : function(webservice,webfunction,nodename,arg1,arg2) {
//gs.include('Pinnacle');
//q=new Pinnacle();
var s = new SOAPMessage(webservice, webfunction);
s.setXMLParameter('arg1', arg1);
s.setXMLParameter('arg2', arg2);
var response = s.post();
//convert web service data to an xml object
var xmldoc = new XMLDocument(response);
var nodelist = xmldoc.getNodes("//"+nodename+"/*");
var elms=nodelist.getLength();
var record={};
for (var i = 0;i<elms;i++) {
var nname=nodelist.item(i).getNodeName();
var nval=nodelist.item(i).getLastChild().getNodeValue();
//record[nname]=q.unescape(nval);
record[nname]=nval;
}
return record;
},
//delete single record
DeleteRecord : function(webservice, recid) {
gs.include('Pinnacle');
var pinn=new Pinnacle();
var s = new SOAPMessage(webservice, 'DELETE');
s.setXMLParameter('arg1',recid);
var response = s.post();
return response;
},
//Execute Command
ExecCmd : function(webservice, cmd, recid) {
gs.include('Pinnacle');
var pinn=new Pinnacle();
var s = new SOAPMessage(webservice, cmd);
s.setXMLParameter('arg1',recid);
var response = s.post();
return response;
},
//Execute Command with 2 args
ExecCmd2 : function(webservice, cmd, recid,arg2) {
gs.include('Pinnacle');
var pinn=new Pinnacle();
var s = new SOAPMessage(webservice, cmd);
s.setXMLParameter('arg1',recid);
s.setXMLParameter('arg2',arg2);
var response = s.post();
return response;
},
//Execute Command with 3 args
ExecCmd3 : function(webservice, cmd, recid,arg2,arg3) {
gs.include('Pinnacle');
var pinn=new Pinnacle();
var s = new SOAPMessage(webservice, cmd);
s.setXMLParameter('arg1',recid);
s.setXMLParameter('arg2',arg2);
s.setXMLParameter('arg3',arg3);
var response = s.post();
return response;
},


//update single record
UpdateRecord : function(webservice, record) {
gs.include('Pinnacle');
var pinn=new Pinnacle();
var sorted=new Array();
for (var k in record) {
sorted.push(k);
}
sorted.sort();
updatexml="";
for (n in sorted) {
var value=q.escapexml(record[sorted[n]]);
updatexml = updatexml+"<"+sorted[n]+">"+value+"</"+sorted[n]+">\n";

}
//gs.log(updatexml);
var s = new SOAPMessage(webservice, 'UPDATE');
s.setXMLParameter('RECORD_XML',updatexml);
var response = s.post();
return response;
},

//Create New record
NewRecord : function(webservice, nodename, record) {
gs.include('Pinnacle');
var q=new Pinnacle();
var sorted=new Array();
for (var k in record) {
  sorted.push(k);
}
sorted.sort();
updatexml="";
for (n in sorted) {
var value=q.escapexml(record[sorted[n]]);
  updatexml = updatexml+"<m:"+sorted[n]+">"+value+"</m:"+sorted[n]+">\n";
}
//gs.log(updatexml);
var s = new SOAPMessage(webservice, 'NEW');
s.setXMLParameter('RECORD_XML',updatexml);
var response = s.post();
//gs.log(response);
var xmldoc = new XMLDocument(response);
var nodelist = xmldoc.getNodes("//"+nodename+"/*");
var elms=nodelist.getLength();
var record={};
for (var i = 0;i<elms;i++) {
  var nname=nodelist.item(i).getNodeName();
//  gs.log(nname);
  if (nodelist.item(i).getLastChild()) {
    var nval=nodelist.item(i).getLastChild().getNodeValue();
    record[nname]=nval;
  }
}
return record;
},
GetMultipleRecords : function(webservice,webfunction,parentnode, nodename,recid) {
//gs.include('Pinnacle');
//q=new Pinnacle();
//gs.log('GMRF')
var s = new SOAPMessage(webservice, webfunction);
s.setXMLParameter('arg1', recid);
var parentnode=parentnode;
var nodename=nodename;
var response = s.post();
//convert web service data to an xml object
var xmldoc = new XMLDocument(response);
var parentlist=xmldoc.getNodes("//"+parentnode+"/*");
var nodelist = xmldoc.getNodes("//"+nodename+"/*");
var parentcount=parentlist.getLength();
var r= new Array();
for (i=0; i<parentcount; i++) {
  r[i]= new Array();
  var n=parentlist.item(i);
  var fldcnt=n.getLength();
  for (j=0;j<fldcnt;j++) {
    var rec=new Array();
      if (n.item(j).getLastChild()) {
        var a=n.item(j).getNodeName();
        var b=n.item(j).getLastChild().getNodeValue();
      }
      else {
        a='';
        b='';
      }
      if (a) {
//        r[i][a]=q.unescapexml(b);
//        gs.log('a='+a+', b='+b);
        r[i][a]=b;
      }
    }
  }
return r;
},
FGet1 : function(webservice,parentnode, nodename,field1,search1) {
//gs.include('Pinnacle');
//q=new Pinnacle();
var s = new SOAPMessage(webservice, 'GET_BY_FIELD');
s.setXMLParameter('arg1', field1);
s.setXMLParameter('arg2',search1);
var parentnode=parentnode;
var nodename=nodename;
var response = s.post();
//convert web service data to an xml object
var xmldoc = new XMLDocument(response);
var parentlist=xmldoc.getNodes("//"+parentnode+"/*");
var nodelist = xmldoc.getNodes("//"+nodename+"/*");
var parentcount=parentlist.getLength();
var r= new Array();
for (i=0; i<parentcount; i++) {
r[i]= new Array();
var n=parentlist.item(i);
var fldcnt=n.getLength();
for (j=0;j<fldcnt;j++) {
var rec=new Array();
if (n.item(j).getLastChild()) {
var a=n.item(j).getNodeName();
var b=n.item(j).getLastChild().getNodeValue();
}
else {
a='';
b='';
}
if (a) {
// r[i][a]=q.unescapexml(b);
// gs.log('a='+a+', b='+b);
r[i][a]=b;
}
}
}
return r;
},


FGet2 : function(webservice,parentnode, nodename,field1,search1,field2,search2) {
//gs.include('Pinnacle');
//q=new Pinnacle();
var s = new SOAPMessage(webservice, 'GET_BY_FIELD2');
s.setXMLParameter('arg1', field1);
s.setXMLParameter('arg2',search1);
s.setXMLParameter('arg3', field2);
s.setXMLParameter('arg4',search2);
var parentnode=parentnode;
var nodename=nodename;
var response = s.post();
//convert web service data to an xml object
var xmldoc = new XMLDocument(response);
var parentlist=xmldoc.getNodes("//"+parentnode+"/*");
var nodelist = xmldoc.getNodes("//"+nodename+"/*");
var parentcount=parentlist.getLength();
var r= new Array();
for (i=0; i<parentcount; i++) {
r[i]= new Array();
var n=parentlist.item(i);
var fldcnt=n.getLength();
for (j=0;j<fldcnt;j++) {
var rec=new Array();
if (n.item(j).getLastChild()) {
var a=n.item(j).getNodeName();
var b=n.item(j).getLastChild().getNodeValue();
}
else {
a='';
b='';
}
if (a) {
// r[i][a]=q.unescapexml(b);
// gs.log('a='+a+', b='+b);
r[i][a]=b;
}
}
}
return r;
},

escapexml : function(rawstr) {
var str=new String(rawstr);
var amp= '&';
var lt='<';
var quote= '\"';
var apos= '/\'';
var gt= '>';
var a=str.length;
var retstr=new String();
var character=new String();
for (i=0; i<a; i++) {
var character=str.charAt(i);
if (character==amp) { character=amp+'amp;'; };
if (character==lt) { character=amp+'lt;'; };
if (character==quote) { character=amp+'quot;'; };
if (character==apos) { character=amp+'apos;'; };
if (character==gt) { character=amp+'gt;'; };
retstr=retstr+character;
}
return retstr + '';

},
unescapexml : function(rawstr) {
var str=new String(rawstr);
var amp= '&';
var lt='<';
var quote= '\"';
var apos= '/\'';
var gt= '>';

var ampstr=amp+'amp;';
var ltstr=amp+'lt;';
var quotestr=amp+'quot;';
var aposstr=amp+'apos;';
var gtstr=amp+'gt;';

var unesc={}
unesc['ampstr']=amp;
unesc['ltstr']=lt;
unesc['quotestr']=quote;
unesc['aposstr']=apos;
unesc['gtstr']=gt;

var a=str.length;
var retstr=new String();
var character=new String();

for (i=0; i<a; i++) {
var character=str.charAt(i);
if (character==amp) {
var esc=amp;
for (j=1; j<6; j++) {
var nextchar=str.charAt(j);
esc=esc+nextchar;
if (nextchar==';') {
if ( unesc[esc] ) {
i=i+j;
character=unesc[esc];
break;
}
}
}
}
retstr=retstr+character;
}
//gs.log(retstr);
return retstr;
}

};
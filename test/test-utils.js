/**
 * Created by Denis on 12/09/2015.
 */
define(['react'], function(React) {
   return {
       renderElement: function(cls, attributes, content) {
           var elem = React.createElement(cls, attributes, content);
           var doc = React.addons.TestUtils.renderIntoDocument(elem);
           return doc.getDOMNode();
       }
   };
});

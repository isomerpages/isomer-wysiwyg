
import rules from './serializeRules'
import Html from 'slate-html-serializer'


// instantiate a new serializer instance with the imported rules
const html = new Html({ rules })

function htmlToSlate(htmlString) {
   return html.deserialize(htmlString) 
}

function slateToHtml(value) {
    return html.serialize(value)
}

export { htmlToSlate, slateToHtml }
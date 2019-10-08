const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

function yamlParser (file) {
  const inputfile = 'test-files/_configs/_config.yml'
  const obj = yaml.load(fs.readFileSync(inputfile, {encoding: 'utf-8'}))
  return obj
}

function frontMatterParser (markdownFile) {
  // format file to extract yaml front matter
  const contents = markdownFile.split('---')
  const articleConfig = contents[1]
  const articleContent = contents[2]

  // parse yaml and retrieve the attributes like layout etc.
  const resultsArr = articleConfig.split('\n').map(curr => {
    // after splitting on new lines, we end up with a couple
    // of empty strings we need to filter out
    if (curr !== '') {
      return {
        // attribute : value map (for example, layout: 'simple-page')
        [curr.split(': ')[0]]: curr.split(': ')[1]
      }
    }
    return curr
  }).filter(function (el) {
    return el !== '';
  })

  // get the configs all in one object
  var configObj = {}
  for (var i = 0; i < resultsArr.length; i++) {
    configObj = Object.assign(configObj, resultsArr[i])
  }

  return {
    configObj,
    content: articleContent
  }
}

// define the different layers of layouts
const firstLayerLayouts = ['test']
const secondLayerLayouts = ['test-me-too']
const thirdLayerLayouts = ['test-me-three']

// define the layout dependency map
// the real layout map will be more complicated and 
// contain a map between all the templates
const layoutMap = {
  // 'test-me-too': 'test',
  // 'test-me-three': 'test-me-too',
  'leftnav-page-content-test': 'leftnav-page-test',
  'leftnav-page-test': 'default-test'
}

// function which returns an object that identifies the
// layout dependencies within each other
// an example object returned is:
// { 'layout-2': 'test-me-three.html',
//  'layout-1': 'test-me-too.html',
//  'layout-0': 'test.html' }
function layoutTrack (test) {
  // implement a while loop
  // while isInMap === true, keep going
  let isInMap = true
  
  // variable to keep track and iterate through the layout map 
  let layout = test

  // array to store all the layouts involved
  const layoutTracker = [layout]

  // get the array of layouts involved
  while (isInMap === true) {
    if (layoutMap[layout]) {
      layout = layoutMap[layout]
      layoutTracker.push(layout)
    } else {
      isInMap = false
    }
  }

  // generate an object to store the layout tracker object
  const layoutTrackerObj = {}

  // loop over array and generate the object containing the map
  for (var i = layoutTracker.length; i > 0; i--) {
    Object.assign(layoutTrackerObj, {
      [`layout-${i-1}`]: `${layoutTracker[layoutTracker.length - i]}.html` 
    })
  }

  return layoutTrackerObj
}

// reads a markdown file and returns an object containing two things:
//     1. front matter 
//     2. markdown content
function markdownParser (file) {
  // read markdown file
  const result = fs.readFileSync(path.resolve(__dirname, file), 'utf8')

  // parse the content and return the front matter as an object
  return frontMatterParser(result)
}

 module.exports = {
  yamlParser,
  frontMatterParser,
  layoutTrack,
  layoutMap,
  markdownParser,
}
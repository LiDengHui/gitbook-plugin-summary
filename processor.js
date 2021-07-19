const Maybe = require('gitbook-plugin-summary-xy/node_modules/folktale/maybe')
const Task = require('gitbook-plugin-summary-xy/node_modules/folktale/concurrency/task')
const Parser = require('markdown-parser')

const { File, Dir } = require('gitbook-plugin-summary-xy/files')

const parseTask = Task.fromNodeback((content, cb) => new Parser().parse(content, cb))

// Config
//    -> List (FileType String Bool)
//    -> Task ( List ( FileType String Markdown ) )
module.exports = config => tree =>
  tree.traverse(Task.of,
    file => {
      const fileResult =
        file.chain(
          file => parseMarkdown(file),
          ([ path, x ]) => Task.of(Dir(path, x))
        )
      return fileResult
    }
  )

// [ path, content ] -> Task File
const parseMarkdown = ([ path, content ]) => {
  if (!content.length) {
    const file = File(path, Maybe.Nothing())
    return Task.of(file)
  }

  return parseTask(content)
    .map(Maybe.Just)
    .map(parsed => File(path, parsed))
}

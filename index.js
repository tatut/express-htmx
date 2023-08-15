const express = require('express')
const app = express()
const port = 3000

var state = {id: 4,
             todos: [{id: 1, label: "Create Express todo app", complete: true},
                     {id: 2, label: "Add HTMX to it", complete: true},
                     {id: 3, label: "Demo the solution at Sappee", complete: false}]};

app.set('view engine', 'pug')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

function render(res, filter) {
    const ts = filter == "all"
          ? state.todos
          : ((filter == "active")
             ? state.todos.filter( t => t.complete == false )
             : state.todos.filter( t => t.complete == true ))
    res.render("index", {todos: ts, filter: filter})
}

app.get("/", (_, res) => render(res,"all"))
app.get("/active", (_,res) => render(res,"active"))
app.get("/completed", (_,res) => render(res,"completed"))
app.post("/new-todo", (req,res) => {

    todos.push({label: req.body["new-todo"], complete: false})
    render(res,req.body["filter"])
})
app.post("/clear-completed",(req,res) => {
    state.todos = state.todos.filter(t => t.complete == false)
    render(res,req.body["filter"])
})
app.post("/toggle", (req,res) => {
    let id = parseInt(req.body["id"])
    state.todos.forEach(t => {
        if(t.id == id)
            t.complete = !t.complete
    })
    render(res,req.body["filter"])
})

app.listen(port, () => {
  console.log(`Express + HTMX TodoMVC app listening on port ${port}`)
})

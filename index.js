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

function render(req, res, filter) {
    const ts = filter == "all"
          ? state.todos
          : ((filter == "active")
             ? state.todos.filter( t => t.complete == false )
             : state.todos.filter( t => t.complete == true ))
    const tpl = req.headers['hx-request'] == 'true' ? "todos" : "index"
    res.render(tpl, {todos: ts, filter: filter})
}

app.get("/", (req, res) => render(req, res,"all"))
app.get("/active", (req,res) => render(req, res,"active"))
app.get("/completed", (req,res) => render(req, res,"completed"))
app.post("/new-todo", (req,res) => {
    state.todos.push({id: state.id++, label: req.body["new-todo"], complete: false})
    render(req, res, req.body["filter"])
})
app.post("/clear-completed",(req,res) => {
    state.todos = state.todos.filter(t => t.complete == false)
    render(req, res,req.body["filter"])
})
app.post("/toggle", (req,res) => {
    let id = parseInt(req.body["id"])
    console.log("state.todos: ", state.todos, ", id: ", id)
    state.todos.forEach(t => {
        if(t.id == id)
            t.complete = !t.complete
    })
    render(req,res,req.body["filter"])
})

app.listen(port, () => {
  console.log(`Express + HTMX TodoMVC app listening on port ${port}`)
})

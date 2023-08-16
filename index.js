const { v4: uuidv4 } = require('uuid');
const express = require('express')
const app = express()
const port = 3000

var state = {id: 4,
             todos: [{id: 1, label: "Create Express todo app", complete: true},
                     {id: 2, label: "Add HTMX to it", complete: true},
                     {id: 3, label: "Demo the solution at Sappee", complete: false}],
             // client uuid => {filter: ..., ws: <connection>}
             clients: {}};

const pug = require('pug');
var expressWs = require('express-ws')(app);
var cookieParser = require('cookie-parser')
app.set('view engine', 'pug')
app.use(cookieParser())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

function todosFor(filter) {
    return filter == "all"
        ? state.todos
        : ((filter == "active")
           ? state.todos.filter( t => t.complete == false )
           : state.todos.filter( t => t.complete == true ))
}
function render(req, res, filter) {
    let hx = req.headers['hx-request'] == 'true'
    const tpl = hx ? "todos" : "index"
    let clientId = req.cookies.client || uuidv4()
    if(!hx) res.cookie("client", clientId)
    let c = state.clients[clientId] || {}
    c.filter = filter
    state.clients[clientId] = c
    res.render(tpl, {todos: todosFor(filter), filter: filter})
}

app.ws('/ws', function(ws, req) {
    state.clients[req.cookies.client].ws = ws;
    console.log("clients: ", state.clients)
})

/* Send updated view to all connected clients, based on their
 * chosen filter. */
const todosTemplate = pug.compileFile("views/todos.pug")
function update() {
    console.log("CLIENTS: ", state.clients)
    for(const [id, c] of Object.entries(state.clients)) {
        let f = c.filter;
        if(c.ws)
            c.ws.send(todosTemplate({todos: todosFor(f), filter: f}))
    }
}

app.get("/", (req, res) => render(req, res,"all"))
app.get("/active", (req,res) => render(req, res,"active"))
app.get("/completed", (req,res) => render(req, res,"completed"))
app.post("/new-todo", (req,res) => {
    state.todos.push({id: state.id++, label: req.body["new-todo"], complete: false})
    update()
    res.status(204).end()
})
app.post("/clear-completed",(req,res) => {
    state.todos = state.todos.filter(t => t.complete == false)
    update()
    res.status(204).end()
})
app.post("/toggle", (req,res) => {
    let id = parseInt(req.body["id"])
    console.log("state.todos: ", state.todos, ", id: ", id)
    state.todos.forEach(t => {
        if(t.id == id)
            t.complete = !t.complete
    })
    update()
    res.status(204).end()
})


app.listen(port, () => {
  console.log(`Express + HTMX TodoMVC app listening on port ${port}`)
})

class TodoBox extends React.Component{
    constructor(props) {
        super(props)
        let defaultTitle = ""
        let defaultDescription = null
        if (props.title != null){
            defaultTitle = props.title
            defaultDescription = props.description
        }

        this.state = {title: defaultTitle, description: defaultDescription}
    }

    setTitle = (e) => {
        if (e.keyCode == 13 && e.target.value.length > 0){
            let newTitle = e.target.value
            this.setState({title: newTitle})
            if (this.state.description != null){
                  var idx = e.target.parentElement.parentElement.parentElement.id
                    var loadingid = $("#hiddenid").val()
                    $.ajax({
                        url: "/save/"+loadingid,
                        method: "POST",
                        data: {
                            "method": "addTodoItem",
                            "arg": idx+";"+newTitle+";"+this.state.description
                        },
                        success: function (result) {

                        }
                    })
            }

        }
        
    }
    setDescription = (e) => {
        if (e.keyCode == 13){
            let newDescription = e.target.value
            this.setState({description: newDescription})
            if (this.state.title.length > 0){
                  var idx = e.target.parentElement.parentElement.parentElement.id
                    var loadingid = $("#hiddenid").val()
                    $.ajax({
                        url: "/save/"+loadingid,
                        method: "POST",
                        data: {
                            "method": "addTodoItem",
                            "arg": idx+";"+this.state.title+";"+newDescription
                        },
                        success: function (result) {

                        }
                    })
            }
        }
    }
    deleteTodo = () => {
        this.props.onDel(this.props.idx)
    }

    initTitle  = () => {
        if (this.state.title == ""){
            return(
                <input className="form-control" type="text" onKeyUp={this.setTitle} placeholder="Enter Title" />
                )
        } else {
            return(
                <p className="lead">{this.state.title}</p>
                )
        }
    }
    initDesc  = () =>{
        if (this.state.description === null){
            return(
                <textarea className="form-control" placeholder="Enter A Description" onKeyUp={this.setDescription} />
                )
        } else {
            return(
                <p>{this.state.description}</p>
                )
        }
    }

    render(){

        return(
            <div className="todo-item">
                <button className={"btn btn-secondary"} onClick={this.deleteTodo}>Delete</button>
                {this.initTitle()}
                {this.initDesc()}
            </div>
        )
            

    }
}

class ListBox extends React.Component{
    constructor(props) {
        super(props)
        var defaultTitle = ""
        if (props.name != null){
            defaultTitle = props.name
        }
        this.state = {title: defaultTitle, todos: [], todoCount: 0}
        if (props.todos != null){
            //console.log(props.todos)
            let tempTodo = [...this.state.todos]
            props.todos.forEach((item) => {
                tempTodo.push(<TodoBox title={item.title} description={item.description} key={tempTodo.length} idx={tempTodo.length}  onDel={this.deleteTodo} />)
            })
            this.state.todos = tempTodo
        }
    }

    handleDel = (e) => {
        this.props.onDel(e.target.parentElement.id, this.state.title);
    }



    setTitle = (e) => {
        if (e.keyCode == 13 && e.target.value.length > 0){
            this.setState({title: e.target.value})
            var loadingid = $("#hiddenid").val()
        $.ajax({
            url: "/save/"+loadingid,
            method: "POST",
            data: {
                "method": "addTodoBox",
                "arg": e.target.value
            },
            success: function (result) {

            }
        })
        }

        
    }

    addTodo = () =>{
        let modTodos = [...this.state.todos]
        let modTodoCount = this.state.todoCount + 1
        modTodos.push(<TodoBox deleteTodo={this.deleteTodo} idx={modTodoCount-1} key={modTodoCount-1}  onDel={this.deleteTodo} />)
        this.state.todoCount = modTodoCount
        this.setState({todos: modTodos, todoCount: modTodoCount})

    }

    deleteTodo = (todo) => {
        let modTodos = [...this.state.todos]
        var idx = null
        var iterator = 0
        modTodos.forEach((item) => {
            if (item.props.idx == todo){
                idx = iterator
            }
            iterator++
        })
        modTodos = modTodos.filter(item => parseInt(item.props.idx) != todo)
        this.setState({todos: modTodos})
        this.props.handleTodoDelete(this.props.pid, idx)
    }

    render(){
        if (this.state.title == ""){
            return(
                <div id={this.props.pid} className="list-item">
                    <button className={"btn btn-secondary"} onClick={this.handleDel}>Delete</button>
                    <br />
                    <input type="text" onKeyUp={this.setTitle} placeholder="Enter Title"/>
                </div>
            )
        
        } else{
            return(<div id={this.props.pid} className="list-item">
                <button className={"btn btn-secondary"} onClick={this.handleDel}>Delete</button>
                <br />
                <h3>{this.state.title}</h3>
                <button className="btn btn-primary" onClick={this.addTodo }>Add Todo Item</button>
                <div className="todo-container">
                {this.state.todos.map((item, idx) => (item))}
                </div>
                
            </div>)
        }
      
        
    }
}
class Renderer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {boxes: []}
    }
    componentDidMount(){
        var that = this
        var loadingid = $("#hiddenid").val()
        if (loadingid != ""){
            $.ajax({
            url: "/load/"+loadingid,
            success: function(result){
                console.log(result)
                let modList = [...that.state.boxes]
                result.groupdata.forEach((item, idx) => {
                    modList.push(<ListBox name={item.metadata.title} todos={item.todos} key={modList.length} pid={modList.length} handleTodoDelete={that.handleTodoDelete} onDel={that.handleDelete} />)
                })
                that.setState({boxes: modList})
                }
            })
        }

        console.log(this.state.boxes)

    }

    addBox = () => {
        let modList = [...this.state.boxes]
        modList.push(<ListBox key={modList.length} pid={modList.length} onDel={this.handleDelete} handleTodoDelete={this.handleTodoDelete} />)
        this.setState({boxes: modList})
    }

    handleTodoDelete = (data, oidx) => {
        let modList = [...this.state.boxes]
        var idx = null
        var iterator = 0
        modList.forEach((item) => {
            if (item.props.pid == data){
                idx = iterator
            }
            iterator++
        })
        var loadingid = $("#hiddenid").val()
        $.ajax({
            url: "/save/"+loadingid,
            method: "POST",
            data: {
                "method": "delTodoItem",
                "arg": idx+";"+oidx
            },
            success: function (result) {

            }
        })

    }

    handleDelete = (data, title) => {
        let modList = [...this.state.boxes]
        var idx = null
        var iterator = 0
        modList.forEach((item) => {
            if (item.props.pid == data){
                idx = iterator
            }
            iterator++
        })
        modList = modList.filter(item => item.props.pid != data)
        this.setState({boxes: modList})
        if (title.length > 0){
             var loadingid = $("#hiddenid").val()
            $.ajax({
                url: "/save/"+loadingid,
                method: "POST",
                data: {
                    "method": "delTodoBox",
                    "arg": idx
                },
                success: function (result) {

                }
            })
        }

    }


    render(){
        return(
            
            <div>
                <div className="header">
                    <button className={"btn btn-primary add-box-btn"} onClick={this.addBox}>Add Group</button>
                </div>
                
                <div className="list-container">
                    {this.state.boxes.map((item,idx) => (
                        item
                    ))}
                </div>
               
            </div>

        )
    }
}


ReactDOM.render(<Renderer/>, document.getElementById("app"))
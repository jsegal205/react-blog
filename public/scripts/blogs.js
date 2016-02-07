// react component setup for blogs.

var BlogList = React.createClass({
  render: function() {
    var blogNodes = this.props.data.map(function(blog){
      return (
        <Blog key={blog.id} author={blog.author} time={blog.time}>
          {blog.text}
        </Blog>
      );
    });
    return (
      <div className="blogList">
        {blogNodes}
      </div>
    );
  }
});

var BlogForm = React.createClass({
  getInitialState: function() {
    return {author: '', text: '', time: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!author || !text) {
      return;
    }
    this.props.onBlogSubmit({author: author, text: text, time: new Date().toLocaleString()});
    this.setState({author: '', text: ''});
  },
  render: function() {
    return (
      <form className="blogForm" onSubmit={this.handleSubmit}>
        <div>
          <label htmlFor="author">Author:</label>
          <input name="author" type="text" placeholder="name" value={this.state.author} onChange={this.handleAuthorChange} />
        </div>
        <div style={{float:'right'}}>
          {this.state.time}
        </div>
        <div>
          <label htmlFor="text">Blog entry:</label>
          <textarea name="text" style={{width:200 +'px', height:200 +'px'}} value={this.state.text} onChange={this.handleTextChange} />
        </div>
        <div>
          <input type="submit" value="Add blog entry" />
        </div>
      </form>
    );
  }
});

var Blog = React.createClass({
  render: function() {
    return (
      <div className="blog">
        <h2 className="blogAuthor">
          {this.props.author}
        </h2>
        <h4>
          {this.props.time}
        </h4>
        {this.props.children}
      </div>
    );
  }
});

var BlogBox = React.createClass({
  loadBlogsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleBlogSubmit: function(blog) {
    var blogs = this.state.data;
    blog.id = blogs[blogs.length - 1].id + 1;
    var newBlogs = blogs.concat([blog]);
    this.setState({data: newBlogs});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: blog,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function(){
    return {data: []};
  },
  componentDidMount: function(){
    this.loadBlogsFromServer();
    setInterval(this.loadBlogsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="blogBox">
        <h1>Blog</h1>
        <BlogList data={this.state.data} />
        <br />
        <BlogForm onBlogSubmit={this.handleBlogSubmit} />
      </div>
    );
  }
});

ReactDOM.render(
  <BlogBox url="/api/blogs" pollInterval={2000} />,
  document.getElementById('blog')
);
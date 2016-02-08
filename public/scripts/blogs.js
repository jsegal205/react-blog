// react component setup for blogs.

var AddComment = React.createClass({
  getInitialState: function() {
    return { showCommentForm: false };
  },
  onClick: function() {
    this.setState({showCommentForm: true});
  },
  render: function() {
    return (
      <div className="addComment">
        <a href="#" onClick={this.onClick}>add comment</a>
        //<CommentForm onCommentSubmit={this.handleCommentSubmit} />
        
      </div>
    )
  }
});

var CommentForm = React.createClass({
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
    this.props.onCommentSubmit({author: author, text: text, time: new Date().toLocaleString()});
    this.setState({author: '', text: ''});
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <div>
          <label htmlFor="author">Author:</label>
          <input name="author" type="text" placeholder="name" value={this.state.author} onChange={this.handleAuthorChange} />
        </div>
        <div style={{float:'right'}}>
          {this.state.time}
        </div>
        <div>
          <label htmlFor="text">Blog entry:</label>
          <input name="text" type="text" placeholder="comment" value={this.state.text} onChange={this.handleTextChange} />
        </div>
        <div>
          <input type="submit" value="Add comment" />
        </div>
      </form>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment){
      return (
        <div className="commentList">
          <Comment key={comment.comment_id} author={comment.comment_author} time={comment.comment_time}>
            {comment.comment_text}
          </Comment>
        </div>
      );
    });
    return (
      <div style={{marginLeft:20 +"px"}}>
        <h3 style={{textDecoration:"underline", display: (commentNodes.length > 0) ? "" : "none"}}>Comments</h3>
        {commentNodes}
      </div>
    );
  }
});

var Comment = React.createClass({
  render: function() {
    return (
      <div>
        <div className="comment">
          <h4 className="commentAuthor">
            {this.props.author}
          </h4>
          <h4>
            {this.props.time}
          </h4>
          {this.props.children}
        </div>
      </div>
    );
  }
});

var BlogList = React.createClass({
  render: function() {
    var blogNodes = this.props.data.map(function(blog){
      return (
        <div className="blogList">
          <Blog key={blog.id} author={blog.author} time={blog.time} comments={blog.comments} url="/api/newcomment">
            {blog.text}
          </Blog>
        </div>
      );
    });
    return (
      <div>
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
      <div>
        <h2>Add new blog entry</h2>
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
      </div>
    );
  }
});

var Blog = React.createClass({
  loadComments: function() {
    return this.props.comments;
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    comment.id = comments[comments.length - 1].id + 1;
    commment.blog_id = this.props.blog.id;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
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
    this.loadComments();
    setInterval(this.loadComments, this.props.pollInterval);
  },
  render: function() {
    return (
      <div>
        <div className="blog">
          <h2 className="blogAuthor">
            {this.props.author}
          </h2>
          <h4>
            {this.props.time}
          </h4>
          {this.props.children}
        </div>
        <CommentList data={this.props.comments} />
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
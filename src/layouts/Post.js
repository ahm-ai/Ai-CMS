import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { ENDPOINTS } from '../services/apiCalls';
import { dateFormat } from '../util/dateFormat';

export default class Post extends Component {

    constructor(props) {
        super(props)
        this.state = { post: [] }
        this.getAllPosts = this.getAllPosts.bind(this)
    }

    componentWillMount() {
        const path = this.props.location.pathname.split('/');

        this.getAllPosts(path[path.length - 1]).then(post => {
            const date = dateFormat(post.date)

            post = { ...post, date, }
            this.setState({ post })
            console.log(post);

        })
    }

    async getAllPosts(location) {
        const result = await ENDPOINTS.getSinglePost(location);
        return result
    }

    render() {
        const { post } = this.state;

        console.log('lllllll');

        let date = new Date();

        return (
            <div className="posts" >

                <section>

                    <div className="container--block ">
                        {/* <div className="col-1 posts__social-column">Social</div> */}
                        <div className="posts__meta">
                            <span className="text__category"> {post.category} </span>
                            <span className="text__date">{post.date}</span>
                        </div>
                        <h2 className="text__title">{post.title}</h2>
                        <div className="col-9">
                            <img src={post.image} alt={post.title} />
                            <div>
                                <p className="" dangerouslySetInnerHTML={{ __html: post.body }} >
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

            </div>

        )
    }
}
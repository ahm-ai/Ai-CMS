import React, { Component } from 'react'
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import DraftPasteProcessor from 'draft-js/lib/DraftPasteProcessor';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import FormFields from '../components/FormFields/FormFields';
import "./CreatePost.scss"
import { handleStorage } from '../util/localStorage';
import { imageHandler } from '../services/apiS3Images';
import { ENDPOINTS } from '../services/apiCalls';


export default class CreatePost extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(),
            body: '', title: '',
            images: [],
            seoUrl: '',
            tags: '',
            category: '',
            body: ''
        }
        this.htmlBody = React.createRef();
        this.imageUpload = React.createRef();

        this.upLoadImage = this.upLoadImage.bind(this);
        this.deleteImage = this.deleteImage.bind(this);

        this.upDateFormData = this.upDateFormData.bind(this);
        this.submitPost = this.submitPost.bind(this);

        this.currentPathToEdit = this.props.computedMatch.params.edit;
    }

    async componentDidMount() {




        if (this.currentPathToEdit) {
            this.setState({ isEdit: true })
            const postEdit = await ENDPOINTS.getSinglePost(this.currentPathToEdit);
            try {
                let editorState;
                const processedHTML = DraftPasteProcessor.processHTML(postEdit.body);
                const contentState = ContentState.createFromBlockArray(processedHTML);
                editorState = EditorState.createWithContent(contentState);
                editorState = EditorState.moveFocusToEnd(editorState);

                return this.setState({ ...this.state, ...postEdit, editorState })
            } catch (error) { }
        }

        let currentBucketId = handleStorage.setLocalStorage();


        // @TODO ALSO WHEN IT'S ALREADY IN STATE
        if (handleStorage.setLocalStorage()) {
            const imagesInBucket = await imageHandler.getListFromS3(currentBucketId);
            this.setState({ images: [...imagesInBucket] })
        }


        this.setState({ bucket: handleStorage.getLocalStorage('bucket') })

    }

    async upLoadImage() {
        let bucketName = handleStorage.getLocalStorage('bucket');

        if (this.state.isEdit) { bucketName = this.state.bucket }
        if (!bucketName) { return }

        imageHandler.addToListS3(bucketName, this.imageUpload.current.files[0])
            .then(file => {
                const image = [`${file.imageUrl.key}`];
                this.setState({ images: [...this.state.images, ...image] })
            })
    }

    async deleteImage(e) {

        const bucketData = e.target.id.split('/');
        // const x = imageHandler.deleteListFromS3(bucketData[0], bucketData[1])
        // this.setState({
        //     images: this.state.images.filter((el, i) => i !== Number(index))
        // })
    }

    onEditorStateChange = (editorState) => {
        this.setState({ editorState, });
    };

    upDateFormData(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    async submitPost(e) {
        e.preventDefault();

        const payload = {
            ...this.state,
            seoUrl: this.state.seoUrl ? this.state.seoUrl.toLowerCase().replace(/\W/g, '-') : '',

            category: this.state.category ? this.state.category.toLowerCase().replace(/\W/g, '-') : '',
            body: this.htmlBody.current.defaultValue, ...{ editorState: '' }
        }
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjViZWIyYTE5ZjFmZTRmOWExNWY3NjFiMSIsInVzZXJuYW1lIjoiZGVtb1VzZXIiLCJwYXNzd29yZCI6IiQyYSQxMCQvUmdQRzVyQmhiUnZBekMuYy94bnJlUDdSTDR0Y1dOMy5HWFBDWDVXMUdBcm9NTUxSWGxhTyIsIl9fdiI6MH0sImlhdCI6MTU0MzcyNzk2MiwiZXhwIjoxNTQ0MzMyNzYyLCJzdWIiOiJkZW1vVXNlciJ9.g0r2HUcVgiUPWiYohJU2cjoaByuc8JUEbv17WdNm80M'

        if (this.state.isEdit) {

            await ENDPOINTS.updatePost(token, payload, this.currentPathToEdit)
            return this.setState({ message: 'Post updated!' })
        }

        const success = await ENDPOINTS.makePost(token, payload)
        this.setState({ message: 'Post created!' })
    }

    render() {
        const { editorState } = this.state;
        return (
            <div className="container--block editor">
                <form>
                    <h2>MAKE NEW BLOG POST</h2>
                    <div className="editor__header">
                        <div>
                            <div>
                                <FormFields
                                    className="form__field"
                                    name='title'
                                    event={this.upDateFormData}
                                    value={this.state.title}
                                    placeholder={this.state.title} />
                            </div>
                            <div className="form__flex">
                                <FormFields
                                    name='tags'
                                    event={this.upDateFormData}
                                    value={this.state.tags}
                                    className="form__flext--3"
                                    placeholder="Separate by , " />

                                <FormFields
                                    className="form__flext--3"
                                    name='seoUrl'
                                    event={this.upDateFormData}
                                    value={this.state.seoUrl}
                                    placeholder="Friendly URL" />

                                <FormFields
                                    name='category'
                                    event={this.upDateFormData}
                                    value={this.state.category}
                                    className="form__flext--3"
                                    placeholder="Category" />
                            </div>

                            <FormFields
                                name='published'
                                event={this.upDateFormData}
                                textLabel="published"
                                type="checkbox"
                                placeholder="Published" />

                            <FormFields
                                name='metaDescription'
                                event={this.upDateFormData}
                                value={this.state.metaDescription}
                                className="form__field "
                                placeholder="SEO Description" />
                            <FormFields
                                name='image'
                                event={this.upDateFormData}
                                value={this.state.image}
                                className="form__field "
                                placeholder="Hero image" />

                            <input onChange={this.upLoadImage}
                                className="editor__file-upload"
                                ref={this.imageUpload}
                                id="image" name="image" type="file" />
                        </div>

                        <div>
                            <div>
                                {this.state.images.map((file, i) => (
                                    <div className="image" key={i} >
                                        <span className="image_delete" onClick={this.deleteImage} id={file}  > X </span>
                                        <img className="image-thumbnail" src={`https://s3.amazonaws.com/livingwithannah/${file}`} alt="el.img" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="editor__footer">
                        <Editor
                            editorState={editorState}
                            wrapperClassName="demo-wrapper"
                            editorClassName="demo-editor"
                            onEditorStateChange={this.onEditorStateChange}
                        />
                        <textarea
                            disabled
                            value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
                            ref={this.htmlBody}
                        />

                        {this.state.message && (
                            <h3>{this.state.message}</h3>
                        )}

                        <button
                            onClick={this.submitPost}
                            className="button--make-post"
                        >
                            Make Post</button>
                    </div>

                </form>


            </div>
        )
    }
}

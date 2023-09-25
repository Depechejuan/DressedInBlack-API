import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Loading from "./Loading";
import getUniquePost from "../services/get-unique-post";
import Buttons from "./Edit-delete-btn";
import getToken from "../services/token/get-token";
import Dates from "./Dates";
import EditPost from "../forms/Edit-Post";


const host = import.meta.env.VITE_API_HOST;

function UniquePost() {
    const [post, setPost] = useState({});
    const [isEditPostVisible, setIsEditPostVisible] = useState(false);

    const { id } = useParams();
    const token = getToken();

    useEffect(() => {
        async function fetchPost() {
            try {
                const data = await getUniquePost(id);
                setPost(data);
            } catch (error) {
                console.error("Error fetching post:", error);
            }
        }
        fetchPost();
    }, [id]);

    const handleEditClick = () => {
        setIsEditPostVisible(!isEditPostVisible); // Cambia el estado de visibilidad al hacer clic en el botón "Edit"
    }


    if (!post.data) {
        return <Loading />;
    }
    
    return(
        <>
            <article className="unique-post-detail">
                <h3 className="post-title">{post.data.title}</h3>
                <Dates date={post.data.createdAt} />
                <p className="post-description">{post.data.description}</p>
                <figure className="post-images">
                    <div className="image-container">
                    {post.data.imageURL.map((image, index) => (
                        // Add "Link" to a preview page / modal
                        <img
                            key={index}
                            src={`${host}${image}`}
                            alt={`Dressed In Black - El mejor TRIBUTO a Depeche Mode de España`}
                            className="every-post-image"
                        />
                    )) }
                    </div>
                </figure>
                {token && <button className="developer-only-btn" onClick={handleEditClick}>Enable Edit</button>}
                
                {isEditPostVisible &&
                    <EditPost id={id} data={post.data} />
                }
            </article>
        </>
    )
}

export default UniquePost;
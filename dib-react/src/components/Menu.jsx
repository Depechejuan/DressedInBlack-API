import {useState, useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import getToken from "../services/token/get-token";
import getUserToken from "../services/token/get-user-token";
import deleteToken from "../services/token/delete-token";

function Menu({isMenuOpen}) {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const token = getToken();
        const userToken = getUserToken();

        if (token && userToken) {
            setIsLoggedIn(true)
        } else {
            setIsLoggedIn(false)
        }
    }, []);

    const handleLogOut = () => {
        deleteToken();
        setIsLoggedIn(false)
        navigate("/")
    }

    return(
        <>
            <nav className={`${isMenuOpen ? "open" : ""} desktop-navbar`}>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/">Quienes Somos</Link>
                    </li>
                    <li>
                        <Link to="/tour">Tour</Link>
                    </li>
                    <li>
                        <Link to="/">Video</Link>
                    </li>
                    <li>
                        <Link to="/">Rider</Link>
                    </li>
                    <li>
                        <Link to="/">Contactar</Link>
                    </li>
                    {isLoggedIn && (
                        <li>
                            <button onClick={handleLogOut}>Logout</button>
                        </li>
                )}
                </ul>
            </nav>
        </>
    );
}

export default Menu;
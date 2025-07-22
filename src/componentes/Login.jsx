import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

export default function Login() {
    return (
        <form>
            <div className="form-group row">
                <label  className="col-sm-2 col-form-label">
                    Email
                </label>
                <div className="col-sm-10">
                    <input
                        type="text"
                        readOnly=""
                        className="form-control-plaintext"
                        id="staticEmail"
                        defaultValue="email@example.com"
                    />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="inputPassword" className="col-sm-2 col-form-label">
                    Password
                </label>
                <div className="col-sm-10">
                    <input
                        type="password"
                        className="form-control"
                        id="inputPassword"
                        placeholder="Password"
                    />
                </div>
            </div>
        </form>
    );
}
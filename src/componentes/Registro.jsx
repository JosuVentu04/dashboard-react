import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

export default function Registro() {
    return (
        <form>
            <div className="form-row">
                <div className="form-group col-md-6">
                    <label htmlFor="inputEmail4">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="inputEmail4"
                        placeholder="Email"
                    />
                </div>
                <div className="form-group col-md-6">
                    <label htmlFor="inputPassword4">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="inputPassword4"
                        placeholder="Password"
                    />
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="inputAddress">Nombre</label>
                <input
                    type="text"
                    className="form-control"
                    id="inputAddress"
                    placeholder="1234 Main St"
                />
            </div>
            <div className="form-group">
                <label htmlFor="inputAddress2">Apellido paterno</label>
                <input
                    type="text"
                    className="form-control"
                    id="inputAddress2"
                    placeholder="Apartment, studio, or floor"
                />
            </div>
            <div className="form-row">
                <div className="form-group col-md-6">
                    <label htmlFor="inputCity">Apellido Materno</label>
                    <input type="text" className="form-control" id="inputCity" />
                </div>
                <div className="form-group col-md-4">
                    <label htmlFor="inputState">Sucursal</label>
                    <select id="inputState" className="form-control">
                        <option selected=""></option>
                        <option>...</option>
                    </select>
                </div>
                <div className="form-group col-md-2">
                    <label htmlFor="inputZip">Puesto</label>
                    <input type="text" className="form-control" id="inputZip" />
                </div>
            </div>
            <div className="form-group">
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="gridCheck" />
                    <label className="form-check-label" htmlFor="gridCheck">
                        Check me out
                    </label>
                </div>
            </div>
            <button type="submit" className="btn btn-primary">
                Sign in
            </button>
        </form>
    );
}
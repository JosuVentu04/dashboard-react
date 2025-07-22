import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="App">
      <div className='Logo'>
        <img src="TituloMarcel1.jpeg" alt="logo" className="logo-superior-izquierda" />
      </div>
      <div className='Formulario' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
        <img src="LogoMarcel1.jpeg" alt="logo" className="logo-centro" />
          <Link to="/login" type="button" style={{marginTop: '10px'}} className="btn-logear btn btn-lg btn-block">Iniciar Sesion</Link>
          <Link to="/registro" type="button" style={{marginTop: '10px'}} className="btn-registrar btn btn-lg btn-block">Registrar Cuenta</Link>
      </div>
    </div>
  );
}

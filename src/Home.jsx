import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  return (
    <div className="App">
      <div className='Logo'>
        <img src="TituloMarcel1.jpeg" alt="logo" className="logo-superior-izquierda" />
      </div>
      <div className='Formulario' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
        <img src="LogoMarcel1.jpeg" alt="logo" className="logo-centro" />
          <a type="button" style={{marginTop: '10px'}} className="btn-logear btn btn-lg btn-block">Iniciar Sesion</a>
          <a type="button" style={{marginTop: '10px'}} className="btn-registrar btn btn-lg btn-block">Registrar Cuenta</a>
      </div>
    </div>
  );
}

const abi = [
    {
      "constant": true,
      "inputs": [{ "name": "", "type": "address" },{ "name": "", "type": "string" }],
      "name": "enviarMensaje",
      "outputs": [],
      "payable": true,
      "type": "function"
   },
   {
    "constant": true,
    "inputs": [{ "name": "", "type": "address" }],
    "name": "mensajesLengthRecibidos",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "type": "function"
   },
   {
    "constant": true,
    "inputs": [{ "name": "", "type": "address" },{ "name": "", "type": "uint256" }],
    "name": "misMensajesRecibidos",
    "outputs": [{ "name": "", "type": "address" },{ "name": "", "type": "string" }],
    "payable": false,
    "type": "function"
   },
   {
    "constant": true,
    "inputs": [{ "name": "", "type": "address" }],
    "name": "mensajesLengthEnviados",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "type": "function"
   },
   {
    "constant": true,
    "inputs": [{ "name": "", "type": "address" },{ "name": "", "type": "uint256" }],
    "name": "misMensajesEnviados",
    "outputs": [{ "name": "", "type": "address" },{ "name": "", "type": "string" }],
    "payable": false,
    "type": "function"
   } 
];
 
const addressContract = '0xCA37b7f3479F92B66496cBD96E60A14841470a4F'; // Testnet

let usdtowei = 0;
let account;
let MyCoin;
let len;
let indexarr;
let get;

let conecatarmeta = document.getElementById('conectar');
let mensaje = document.getElementById('mensaje');
let destinatario = document.getElementById('destinatario');
let pass = document.getElementById('pass');
let enviar = document.getElementById('enviar');

let origen = document.getElementById('origen');
let mensajeorigen = document.getElementById('mensajeorigen')
let passdes = document.getElementById('passdes')
let desencriptar = document.getElementById('desencriptar')

let mensajeanterior = document.getElementById('mensajeanterior')
let mensajesiguiente = document.getElementById('mensajesiguiente') 
let donarmas = document.getElementById('donarmas') 
let actualizar = document.getElementById('actualizar')
let divresponder = document.getElementById('divresponder')

let mensajesrecibidos = document.getElementById('mensajesrecibidos')
let mensajesenviados = document.getElementById('mensajesenviados')

async function inicio(){

  conecatarmeta.addEventListener('click', async() => {

    if(typeof window.ethereum == 'undefined'){
      window.open("https://metamask.io/", '_blank');
      return
    }
    await checkMetamaskConnection()
  });
}


// Verifica si Metamask está conectado a la red de Polygon
async function checkMetamaskConnection() {
  const web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const networkVersion = await web3.eth.net.getId();
  if (networkVersion == 137) {
    //Metamask está conectado a la red de Polygon
    await getMetamaskInfo()
  } else {
    //Metamask no está conectado a la red de Polygon
    //await addPolygonNetwork()
    addPolygonNetworkPruebas()
  }
}

// Agrega la red a Metamask
async function addPolygonNetwork() {
  try {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x89', // Chain ID de Polygon
        chainName: 'Polygon Mainnet',
        rpcUrls: ['https://polygon-rpc.com/'], // Endpoint RPC de la red de Polygon MAINET
        nativeCurrency: {
          name: 'Matic',
          symbol: 'MATIC',
          decimals: 18
        },
        blockExplorerUrls: ['https://polygonscan.com/'] // Explorador de bloques de Polygon
      }]
    });
    await getMetamaskInfo()
  } catch (error) {
    console.error(error);
  }
}

// Agrega la red a Metamask
async function addPolygonNetworkPruebas() {
  try {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x13881', // Chain ID de Polygon
        chainName: 'Polygon Mainnet',
        rpcUrls: ['https://rpc-mumbai.maticvigil.com'], // Endpoint RPC de la red de Polygon MAINET
        nativeCurrency: {
          name: 'Matic',
          symbol: 'MATIC',
          decimals: 18
        },
        blockExplorerUrls: ['https://mumbai.polygonscan.com/'] // Explorador de bloques de Polygon
      }]
    });
    await getMetamaskInfo()
  } catch (error) {
    console.error(error);
  }
}



async function getMetamaskInfo(){
    const accounts = await ethereum.request({method: 'eth_requestAccounts'});
    if(!accounts){
      console.log("no se pudo conectar con metamask");
      return
    }
    get = 'recibidos'
    account = accounts[0];
    conecatarmeta.innerText = account.substr(0,7) + "..." + account.substr(-7)
    web3 = new Web3(window.ethereum);
    MyCoin = new web3.eth.Contract(abi, addressContract);
    detectarcambiodecuenta()

    len = await MyCoin.methods.mensajesLengthRecibidos(account).call();
    if(len > 0){
      len --;  
      indexarr = len;
      cargarmensajesrecibidos(len)
    }
    enviomensajes()
    recepcionmensajes()
}



async function enviomensajes(){
  enviar.addEventListener('click', async() => {
   
    if(!account){
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Metamask no esta conectado',
        showConfirmButton: false,
        timer: 2500
      })
      return
    }
    if(!mensaje.value){
      mensaje.placeholder="Contenido mensaje (Requerido antes de enviar)"
      return
    }
    if(!pass.value){
      pass.placeholder="Contraseña (Requerido antes de enviar)"
      return
    }
    if(!destinatario.value){
      destinatario.placeholder="Address destinatario (Requerido antes de enviar)"
      return
    }
    if(!web3.utils.isAddress(destinatario.value.toString())){
      destinatario.value = ""
      destinatario.placeholder="Address destinatario (No es una direccion válida)"
      return
    }

    let mensajeencrypted = await CryptoJS.AES.encrypt(mensaje.value,pass.value);
    await donar();

    MyCoin.methods.enviarMensaje(destinatario.value.toString(), mensajeencrypted.toString())
    .send({from: account, value: usdtowei.split('.')[0]})
    .on('Error', function(error){
      console.log("Se produjo un error, verifique que Metamask este conectado");
    })
    .on('transactionHash', function(txHash){
      
      mensaje.value = ""
      destinatario.value = ""
      pass.value = ""

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Se envio correctamente',
        showConfirmButton: false,
        timer: 2500
      })

    });
  })
  donarmas.addEventListener('click', async() => {
    var input = document.getElementById("donar")
    console.log(input.value)
    input.value = parseInt(input.value) + 1;
  })
}
async function recepcionmensajes(){
  desencriptar.addEventListener('click', async() => {
  
    if(!mensajeorigen.value){
      mensajeorigen.placeholder="Contenido mensaje (No tiene mensajes)"
      return
    }
    if(!passdes.value){
      passdes.placeholder="Contraseña (Requerido antes de desencriptar)"
      return
    }

    var decrypted = CryptoJS.AES.decrypt(mensajeorigen.value,passdes.value).toString(CryptoJS.enc.Utf8);
    if(decrypted == ''){
      passdes.value = ""
      passdes.placeholder="Contraseña (Contraseña incorrecta)"
      return
    }
    mensajeorigen.value = decrypted
    passdes.value = ''
  })  
  mensajeanterior.addEventListener('click', async() => {
    if(len > 0){
      len--;
      passdes.value = ""
      if(get == 'recibidos'){
        cargarmensajesrecibidos(len)
      }else{
        cargarmensajesenviados(len)
      }
    }
  })
  mensajesiguiente.addEventListener('click', async() => {
    if(len < indexarr){
      len ++;
      passdes.value = ""
      if(get == 'recibidos'){
        cargarmensajesrecibidos(len)
      }else{
        cargarmensajesenviados(len)
      }
    }
  })
  actualizar.addEventListener('click', async() => {
    mensajeorigen.value = ""
    passdes.value = ""
    if(get == 'recibidos'){
      origen.innerHTML = "Origen mensaje"
      len = await MyCoin.methods.mensajesLengthRecibidos(account).call();
      if(len > 0){
        len --; 
        cargarmensajesrecibidos(len)
      }
    }else{
      origen.innerHTML = "Destino mensaje"
      len = await MyCoin.methods.mensajesLengthEnviados(account).call();
      if(len > 0){
        len --; 
        cargarmensajesenviados(len)
      }
    }
  })
  divresponder.addEventListener('click', async() => {
    if(!mensajeorigen.value){
      mensajeorigen.placeholder="Contenido mensaje (No tiene mensajes)"
      return
    }
    destinatario.value = origen.innerHTML
    destinatario.classList.add('parpadea');
  })
  mensajesrecibidos.addEventListener('click', async() => {
    get = 'recibidos'
    origen.innerHTML = 'Origen mensaje'
    mensajeorigen.value = ''
    passdes.value = ''
    
    //document.getElementById('aresponder').style.display = 'fixed'
    document.getElementById('divresponder').style.display = 'inline'

    mensajesrecibidos.style.backgroundColor = '#2b323a';
    mensajesrecibidos.style.color = '#dab509';
    mensajesenviados.style.backgroundColor = '#75818f';
    mensajesenviados.style.color = '#000000';
    len = await MyCoin.methods.mensajesLengthRecibidos(account).call();
    if(len > 0){
      len --;  
      indexarr = len;
      cargarmensajesrecibidos(len)
    }

  })
  mensajesenviados.addEventListener('click', async() => {
    get = 'enviados'
    origen.innerHTML = 'Destino mensaje'
    mensajeorigen.value = ''
    passdes.value = ''
    //document.getElementById('aresponder').style.display = 'none'
    document.getElementById('divresponder').style.display = 'none'
    mensajesenviados.style.backgroundColor = '#2b323a';
    mensajesenviados.style.color = '#dab509';

    mensajesrecibidos.style.backgroundColor = '#75818f';
    mensajesrecibidos.style.color = '#000000';
    len = await MyCoin.methods.mensajesLengthEnviados(account).call();
    
    if(len > 0){
      len --;  
      indexarr = len;
      cargarmensajesenviados(len)
    }

  })
}

async function cargarmensajesrecibidos(len){
  let mensajes = await MyCoin.methods.misMensajesRecibidos(account, len).call();
  origen.innerHTML = mensajes[0];
  mensajeorigen.value = mensajes[1]
}
async function cargarmensajesenviados(len){
  let mensajes = await MyCoin.methods.misMensajesEnviados(account, len).call();
  origen.innerHTML = mensajes[0];
  mensajeorigen.value = mensajes[1]
}
async function donar(){
  const cantidad = document.getElementById("donar").value
  const urldolar = 'https://min-api.cryptocompare.com/data/price?fsym=MATIC&tsyms=USD';
  const dolarobj = await fetch(urldolar);
  const {USD} = await dolarobj.json();

  let weiValue = Web3.utils.toWei('1', 'ether');
  usdtowei = ((cantidad*weiValue)/USD).toString();
}
function detectarcambiodecuenta(){
  window.ethereum.on('accountsChanged', async function(accounts){
    
    account = accounts[0];
    conecatarmeta.innerText = account.substr(0,4) + "..." + account.substr(-4);
    
    mensajeorigen.value = ""
    passdes.value = ""
    if(get == 'recibidos'){
      origen.innerHTML = "Origen mensaje"
      len = await MyCoin.methods.mensajesLengthRecibidos(account).call();
      if(len > 0){
        len --; 
        cargarmensajesrecibidos(len)
      }
    }else{
      origen.innerHTML = "Destino mensaje"
      len = await MyCoin.methods.mensajesLengthEnviados(account).call();
      if(len > 0){
        len --; 
        cargarmensajesenviados(len)
      }
    }


  });
}

document.getElementById('divmensajes').clientHeight = document.getElementById('divenviar').style.height

inicio();
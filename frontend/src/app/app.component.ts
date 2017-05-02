import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, AlertController  } from 'ionic-angular';
import { StatusBar, Splashscreen, Network, Push, Geolocation, NativeStorage, Deeplinks, Diagnostic } from 'ionic-native';
import { Home, ViewProdutoPage, LoginPage } from '../pages';
import { SharingService } from '../services/sharing-service';

//Utilizado para tratar as resposta de verificacao do GPS
const SUCCESS             = 0;
const ERRO_GPS_DISABLED   = 1;
const ERRO_NOT_AUTHORIZED = 2;


@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  rootPage: any;
  pages: Array<{title: string, component: any}>;  
  disconnectSubscription: any;
  flVeioDoPush: boolean;

  constructor(public platform: Platform, 
              public sharingService: SharingService,
              public alertCtrl: AlertController) {    
    this.initializeApp();    
    // watch network for a disconnect
    this.disconnectSubscription = Network.onDisconnect().subscribe(() => {
      this.openAlertNotInternet();
    }); 
  }

 initializeApp() {
    this.flVeioDoPush = false;
    this.platform.ready().then(() => {
      
    this.verificaGPSAtivo()
      .then((resp) => {                
        //pega os produtos pela localizacao do usuario
        Geolocation.getCurrentPosition({timeout: 10000})
          .then((resp) => {
              this.sharingService.setLat(resp.coords.latitude);
              this.sharingService.setLng(resp.coords.longitude); 
            
              let env = this;
              NativeStorage.getItem('user')
                .then( function (usuario) {
                  env.sharingService.setCdusuario(usuario.cdusuario);
                  env.sharingService.insereUsuario(usuario);
                  // se o usuario esta entrando pelo push notification ele cai direto dentro da tela de ViewProdutoPage
                  if(!env.flVeioDoPush){
                    env.nav.setRoot(Home);
                    Splashscreen.hide();
                  }
                }, function (error) {
                  env.nav.setRoot(LoginPage);
                  Splashscreen.hide();
                });
          }).catch((error) => {
              // this.verificaGPSAtivo();
              this.openAlertNotGeolocation("O Geladas não conseguiu pegar sua localização", "Por favor ligue sua localização e tente novamente.");
          });
      }).catch((error) => {
        console.log("Error verificaGPSAtivo: "+error); 
        if(error === ERRO_GPS_DISABLED){
          this.openAlertNotGeolocation("O serviço de localização esta desligado", "Por favor ligue sua localização e tente novamente.");
        } else {
          this.openAlertNotGeolocation("Você deve permitir que o aplicativo pegue sua localização", "Por favor autorize o serviço de localização e tente novamente.");        
        }
      });
      
      StatusBar.styleDefault();
      this.initPushNotification();      
      this.initDeeplink();
    });
  }

  verificaGPSAtivo(): Promise<any> {
    return new Promise((resolve, reject) => {
        Diagnostic.isGpsLocationEnabled().then((enabled) => {
          if(!enabled){            
            reject(ERRO_GPS_DISABLED);
          }
        }).catch((error) => {
          reject(ERRO_GPS_DISABLED);          
        });

        Diagnostic.isLocationAuthorized().then((enabled) => {
          if(!enabled){
            reject(ERRO_NOT_AUTHORIZED);            
          } else {
            resolve(SUCCESS);
          }
        }).catch((error) => {
          reject(ERRO_NOT_AUTHORIZED);
        });
    });
  }

  initDeeplink(){
    //This is the code who responds to the app deeplinks
    //Deeplinks if from Ionic Native
    Deeplinks.routeWithNavController(this.nav, {
        '/produto/:codigo': ViewProdutoPage
      }).subscribe((match) => {
        console.log('Successfully routed', match);
      }, (nomatch) => {
        console.log('Unmatched Route', nomatch);
      });      
  }

  initPushNotification(){
    if (!this.platform.is('cordova')) {
      console.warn("Push notifications not initialized. Cordova is not available - Run in physical device");
      return;
    }

    var push = Push.init({
        android: {
          senderID: "449887022881",
          icon:"icon"
        },
        ios: {
          alert: "true",
          badge: true,
          sound: 'false'
        },
        windows: {}
      });

      push.on('registration', (data) => {        
        this.sharingService.setDevicetoken(data.registrationId);
        console.log("device token: "+data.registrationId);
      });

      push.on('notification', (data) => {
        let self = this;        
        let json = JSON.parse(JSON.stringify(data.additionalData));
        if (data.additionalData.foreground) {          
          let confirmAlert = this.alertCtrl.create({
            title: data.title,
            message: data.message,
            buttons: [{
              text: 'Ignorar',
              role: 'cancel'
            }, {
              text: 'Ver',
              handler: () => {
                self.nav.push(ViewProdutoPage, {codigo: json.codigo});
              }
            }]
          });
          confirmAlert.present();
        } else {          
          self.flVeioDoPush = true;
          Splashscreen.hide();
          //self.nav.insert(0, Home);
          self.nav.push(ViewProdutoPage, {codigo: json.codigo});
        }
      });

      push.on('error', (e) => {
        console.log(e.message);
      });
  }

  openAlertNotInternet(){
    let alert = this.alertCtrl.create({
            title: "Sem conexão com a internet",
            subTitle: "Por favor verifique sua conexão e tente novamente.",
            buttons: [{
              text: 'Ok',
              handler: () => {
                this.platform.exitApp();
              }
            }]
        });
    alert.present();
  }

  openAlertNotGeolocation(title: string, subTitle: string){
    let alert = this.alertCtrl.create({
            title: title,
            subTitle: subTitle,
            buttons: [{
              text: 'Ok',
              handler: () => {
                this.platform.exitApp();
              }
            }]
        });
    alert.present();
  }
}
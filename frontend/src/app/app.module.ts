import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp }                  from './app.component';
import { Home, CadProdutoPage, FiltrosPage, ConfigPage, 
        LojaPage, LoginPage, MapaPage, TutorialPage, ViewProdutoPage, MarcaPage } from '../pages';

import { SharingService }         from '../services/sharing-service';
import { MoedaRealPipe }          from '../pipes/moeda-real';

import { ProdutoItem, PrecoComponent, AutocompleteComponent } from '../componentes';
import { AdMob }  from '@ionic-native/admob';

@NgModule({
  declarations: [
    MyApp,
    Home,
    LoginPage,
    CadProdutoPage,
    FiltrosPage,
    ConfigPage,
    LojaPage,
    MoedaRealPipe,
    ProdutoItem,
    PrecoComponent,
    ViewProdutoPage,
    MapaPage,
    TutorialPage,
    AutocompleteComponent,
    MarcaPage
  ],
  imports: [
    IonicModule.forRoot(MyApp,{
        backButtonText: ''
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Home,
    LoginPage,
    CadProdutoPage,
    FiltrosPage,
    ConfigPage,
    LojaPage,
    ProdutoItem,
    PrecoComponent,
    ViewProdutoPage,
    MapaPage,
    TutorialPage,
    AutocompleteComponent,
    MarcaPage
  ],
  providers: [
      {provide: ErrorHandler, useClass: IonicErrorHandler},
      SharingService,
      AdMob
    ]
})

export class AppModule {}
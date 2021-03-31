import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  IModuleTranslationOptions,
  ModuleTranslateLoader,
} from '@larscom/ngx-translate-module-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import {
  FacetGroupModule,
  SearchFieldModule,
  SearchResultsWrapperModule,
} from '@redlink/amsui';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { OverlayModule } from '@angular/cdk/overlay';

export function moduleHttpLoaderFactory(
  http: HttpClient
): ModuleTranslateLoader {
  const baseTranslateUrl = './assets/i18n';

  const options: IModuleTranslationOptions = {
    modules: [
      { baseTranslateUrl: baseTranslateUrl + '/amsui' },
      { baseTranslateUrl },
    ],
  };

  return new ModuleTranslateLoader(http, options);
}
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: moduleHttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    SearchFieldModule,
    MatSidenavModule,
    OverlayModule,
    MatButtonModule,
    FacetGroupModule,
    MatBadgeModule,
    MatTooltipModule,
    MatIconModule,
    SearchResultsWrapperModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

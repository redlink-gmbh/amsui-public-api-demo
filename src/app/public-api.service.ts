import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { catchError, map, timeout } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import {
  Facet,
  FacetEntry,
  ResultEntry,
  SearchService,
  SuggestionParameter,
} from '@redlink/amsui';
import { PublicApiEntry, PublicApiResponse } from './public-api.type';

@Injectable({
  providedIn: 'root',
})
export class PublicApiService {
  private authFacetConfig = [
    {
      name: 'OAuth',
      viewName: 'OAuth',
    },
    {
      name: 'apiKey',
      viewName: 'API Key',
    },
    {
      name: 'null',
      viewName: 'No Authentication needed',
    },
  ];
  constructor(
    private readonly http: HttpClient,
    private readonly searchService: SearchService
  ) {}

  search(keyword: string): void {
    this.searchService.startLoading();
    let params = new HttpParams();
    params = params.set('title', keyword);
    this.searchService.selectedFacets.forEach((facet) => {
      params = params.set(facet.facetName, facet.facetEntryName);
    });
    this.http
      .get<PublicApiResponse>(environment.backendURL + 'entries', {
        params,
      })
      .subscribe((response) => {
        this.searchService.searchResultMeta = {
          numFound: response.count,
          keyword,
          timeTaken: 500,
          numShowed: response.count,
        };
        if (response.count > 0) {
          const facets: Facet[] = [];
          this.searchService.searchResults = response?.entries.map((entry) => {
            const subTitles = [];
            if (entry.HTTPS) {
              subTitles.push({
                name: 'https',
                icon: 'https',
                description: 'Secured via HTTPS',
              });
            }
            subTitles.push({
              name: 'auth',
              icon: 'password',
              description: entry.Auth
                ? 'Authentication via ' + entry.Auth
                : 'No authentication needed',
            });
            return {
              title: entry.API,
              description: entry.Description,
              subTitles,
              tags: [entry.Category],
              actions: [{ icon: 'launch', name: 'Go to API' }],
              id: entry.Link,
            } as ResultEntry;
          });
          const authEntries: FacetEntry[] = [];
          this.authFacetConfig.forEach((authFacet) => {
            const numOfFacetResults = response?.entries
              .map((entry) => {
                return entry.Auth ? entry.Auth : 'null';
              })
              .filter((entry) => entry === authFacet.name).length;
            if (numOfFacetResults > 0) {
              authEntries.push({
                name: authFacet.name,
                viewName: authFacet.viewName,
                numberOfResults: numOfFacetResults,
                selected: this.searchService.selectedFacets.some((facet) => {
                  return (
                    facet.facetName === 'auth' &&
                    facet.facetEntryName === authFacet.name
                  );
                }),
              });
            }
          });
          facets.push({
            name: 'auth',
            screenName: 'Authentication',
            entries: authEntries,
            options: {},
          });
          this.searchService.facets = facets;
        } else {
          this.searchService.searchResults = [];
          this.searchService.facets = [];
          this.searchService.selectedFacets = [];
        }
        this.searchService.stopLoading();
      });
  }
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(environment.backendURL + 'categories').pipe(
      timeout(10000),
      catchError(() => {
        return of([]);
      }),
      map((response) => {
        console.log(response);
        return response;
      })
    );
  }
  getSearchSuggestions(input: SuggestionParameter): Observable<string[]> {
    return this.http
      .get<any>(environment.backendURL + 'entries', {
        params: new HttpParams().set('title', input.keyword),
      })
      .pipe(
        timeout(10000),
        catchError(() => {
          return of([]);
        }),
        map((response) => {
          if (response && response.count > 0) {
            return response.entries
              .map((entry: PublicApiEntry) => entry.API)
              .slice(0, input.numberOfSuggestions);
          }
        })
      );
  }
}

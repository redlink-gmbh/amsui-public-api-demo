import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  Breakpoints,
  Facet,
  NoResultsConfig,
  paramsNotEmpty,
  paramsToSelectedFacets,
  resetToQueryParam,
  ResultEntry,
  ResultEntryActionEvent,
  ResultViewConfig,
  SearchFieldConfig,
  SearchResultMeta,
  SearchService,
  SelectedFacet,
  SuggestionParameter,
} from '@redlink/amsui';
import { PublicApiService } from './public-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(CdkOverlayOrigin) origin!: CdkOverlayOrigin;
  searchKeyword = '';
  didYouMeanSearchValue = '';
  facets$: Observable<Facet[]> = of([]);
  results$: Observable<ResultEntry[]> = of([]);
  searchResultMeta$: Observable<SearchResultMeta> = of({
    numFound: -1,
    keyword: '',
    timeTaken: -1,
    numShowed: -1,
  });
  resultViewConfig: ResultViewConfig = {
    sortingOptions: [
      { value: 'relevance', viewValue: 'Relevanz' },
      { value: 'title', viewValue: 'Titel', fieldOfResults: 'title' },
    ],
    resultViewTypes: ['list', 'grid'],
    selectedResultViewType: 'grid',
  };
  noResultsConfig: NoResultsConfig = {
    alternativeKeywords: ['Sports', 'Jobs', 'News', 'Books'],
    alternativeResults: [],
    didYouMeanValue: '',
    searchKeyword: this.searchKeyword,
    contactPhoneNumber: '+43 662 27 66 80',
    contactMailAddress: 'office@redlink.at',
  };
  searchFieldConfig: SearchFieldConfig = {
    value: this.didYouMeanSearchValue,
    asyncSuggestionDataProvider: this.handleInputEvent.bind(this),
  };
  isMobile = false;
  isTablet = false;
  private notifierDestroySubs = new Subject();

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly searchService: SearchService,
    private readonly publicApiService: PublicApiService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly translateService: TranslateService
  ) {
    this.translateService.setDefaultLang('de');
    this.translateService.use('en');
  }

  ngOnInit(): void {
    this.facets$ = this.searchService.facets$;
    this.results$ = this.searchService.searchResults$;
    this.searchResultMeta$ = this.searchService.searchResultMeta$;
    this.breakpointObserver
      .observe([Breakpoints.Mobile, Breakpoints.Tablet])
      .pipe(takeUntil(this.notifierDestroySubs))
      .subscribe((result) => {
        this.isMobile = result.breakpoints[Breakpoints.Mobile];
        this.isTablet = result.breakpoints[Breakpoints.Tablet];
      });
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.notifierDestroySubs))
      .subscribe((params) => {
        if (paramsNotEmpty(params)) {
          this.searchKeyword = params.q || '';
          if (this.searchKeyword !== '') {
            this.searchService.selectedFacets = paramsToSelectedFacets(params);
            this.publicApiService.search(this.searchKeyword);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.notifierDestroySubs.next();
    this.notifierDestroySubs.complete();
  }

  ngAfterViewInit(): void {
    this.searchService.overlayElement = this.origin.elementRef;
  }

  facetChanged(selectedFacet: SelectedFacet): void {
    this.searchService.toggleSelectedFacet(selectedFacet);
    this.publicApiService.search(this.searchKeyword);
  }

  handleSearchEvent(searchKeyword: string): void {
    this.didYouMeanSearchValue = '';
    this.searchKeyword = searchKeyword;
    this.noResultsConfig.searchKeyword = searchKeyword;
    this.resetFacets();
    this.publicApiService.search(this.searchKeyword);
  }

  getBadgeNumber(): number {
    return this.searchService.selectedFacets.length;
  }

  resetSelectedFacets(): void {
    this.resetFacets();
    resetToQueryParam('q', this.searchKeyword);
    this.publicApiService.search(this.searchKeyword);
  }

  handleInputEvent(input: SuggestionParameter): Observable<string[]> {
    return this.publicApiService.getSearchSuggestions(input);
  }

  didYouMeanSearch(didYouMeanValue: string): void {
    this.didYouMeanSearchValue = didYouMeanValue;
    this.searchFieldConfig = {
      ...this.searchFieldConfig,
      value: didYouMeanValue,
    };
    this.searchKeyword = didYouMeanValue;
    this.resetFacets();
    this.publicApiService.search(didYouMeanValue);
  }

  private resetFacets(): void {
    this.searchService.selectedFacets = [];
  }

  onResultEntryClicked(resultEntryActionEvent: ResultEntryActionEvent): void {
    // the link is saved to the id property
    // normally you would get the id back and make another request with the ID
    if (resultEntryActionEvent.entry.id) {
      window.open(resultEntryActionEvent.entry.id, '_blank');
    }
  }
}

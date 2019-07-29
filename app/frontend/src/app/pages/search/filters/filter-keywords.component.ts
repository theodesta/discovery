import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterContentInit,
  OnChanges
} from '@angular/core';
import { SearchService } from '../search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterSelectedComponent } from './filter-selected.component';
declare let autocomplete: any;
declare let document: any;
declare const $: any;
@Component({
  selector: 'discovery-filter-keywords',
  templateUrl: './filter-keywords.component.html',
  styles: []
})
export class FilterKeywordsComponent  implements OnInit, OnChanges {
  @ViewChild(FilterSelectedComponent)
  msgAddedItem: FilterSelectedComponent;
  @Input()
  items: any[] = [];
  keywords_results: any[] = [];
  _keywords = '';
  items_filtered: any[] = [];
  items_selected: any[] = [];
  selected = 0;
  @Input()
  opened = true;
  @Output()
  emmitSelected: EventEmitter<number> = new EventEmitter();
  @Output()
  emmitLoaded: EventEmitter<string> = new EventEmitter();
  @Output()
  emitClearedSelected: EventEmitter<boolean> = new EventEmitter();
  name = 'Keywords';
  queryName = 'keywords';
  id = 'filter-keywords';
  placeholder;
  error_message;
  json_value = 'id';
  json_description = 'name';
  timer: any;
  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  set keywords(value: string) {
    this._keywords = value;
  }
  get keywords(): string {
    return this._keywords;
  }
  ngOnInit() {}

  ngOnChanges() {
    if (this.items.length > 1) {
      this.setKeywords();
    }
  }

  setKeywords() {
    this.items = this.searchService.buildKeywordsDropdown(this.items);
     /** Grab the queryparams and sets default values
      *  on inputs Ex. checked, selected, keywords, etc */
      if (this.route.snapshot.queryParamMap.has(this.queryName)) {
        const values: string[] = this.route.snapshot.queryParamMap
          .get(this.queryName)
          .split('__');

        for (const id of values) {
          this.addItem(id);
        }
        /** Open accordion */
        this.opened = true;        
      }
      if (this.route.snapshot.queryParamMap.has('vehicles')) {
        const values: string[] = this.route.snapshot.queryParamMap
          .get('vehicles')
          .split('__');
  
        this.setFilteredItems(values);
      } else {
        this.setFilteredItems(['All']);
      }
      this.emmitLoaded.emit(this.queryName);
  }
  setFilteredItems(vehicles) {
    this.items_filtered =
      vehicles[0] !== 'All'
        ? this.filterByVehicles(vehicles)
        : this.returnUnique(this.items);
    this.items_filtered.sort(this.searchService.sortByIdAsc);
    this.keywords_results = this.items_filtered;
  }
  returnUnique(items: any[]): any[] {
    const unique_items = [];
    for (const item of items) {
      if (!this.searchService.existsIn(unique_items, item.id, 'id')) {
        unique_items.push(item);
      }
    }
    return unique_items;
  }
  filterByVehicles(vehicles: any[]) {
    const items: any[] = [];
    for (const item of vehicles) {
      for (const prop of this.items) {
        const arr = item.split('_');
        if (prop['vehicle_id'].indexOf(arr[0]) !== -1) {
          if (!this.searchService.existsIn(items, prop.id, 'id')) {
            items.push(prop);
          }
        }
      }
    }
    return items;
  }
  getItemId(value: string): string {
    if (value) {
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i]['id'] === value) {
          return this.items[i]['text'];
        }
      }
    }
  }
  getItemDescription(id: number): string {
    if (id) {
      for (let i = 0; i < this.items.length; i++) {
        if (+this.items[i]['id'] === id) {
          return this.items[i]['text'];
        }
      }
    }
  }
  addKeyword(itemId) {
  
    this.items_selected = [];
    if (itemId === '0') {
      this.reset();
      return;
    }
    if (!this.searchService.existsIn(this.items_selected, itemId, 'value')) {
      this.addItem(itemId);
    }
  }
  getSelected(selectedOnly: boolean): any[] {
    const item = [];
    if (selectedOnly) {
      return this.items_selected;
    }
    if (this.items_selected.length > 0) {
      item['name'] = this.queryName;
      item['description'] = this.name;
      item['items'] = this.items_selected;
    }
    return item;
  }
  reset() {
    this.items_selected = [];
    this.selected = 0;
    this.emitClearedSelected.emit(true);
    $('#select2-filter-keywords-input-container').text('Select Keywords');
  }
  getPoolsIds(id: string): any[] {
    const ids = [];
    for (const prop of this.items) {
      if (prop.id == id) {
        if(Array.isArray(prop.pool_id)) {
          for(const item of prop.pool_id) {
            ids.push(item);
          }
        } else {
          ids.push(prop.pool_id);
        }
      }
    }
    return ids;
  }
  addItem(id: string) {
    const item = {};
    this.emitClearedSelected.emit(true);

    if (id && id !== '') {
      item['value'] = id;
      item['description'] = this.getItemDescription(+id);
      item['pools_ids'] = this.getPoolsIds(id);
    }

    this.items_selected.push(item);
    this.emmitSelected.emit(1);
    // this.msgAddedItem.showMsg();
  }
  removeItem(value: string) {
    this.reset();
    // for (let i = 0; i < this.items_selected.length; i++) {
    //   if (this.items_selected[i]['value'] === value) {
    //     this.items_selected.splice(i, 1);
    //   }
    // }
    if (this.items_selected.length === 0) {
      this.emitClearedSelected.emit(true);
    }
    this.emmitSelected.emit(0);
  }
}

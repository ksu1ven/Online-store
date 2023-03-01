import * as products from '../../data/data.json' assert {type: 'json'};
import './filters.css'

interface IProduct { id: number; title: string; brand: string; description: string; family: string; size: number[]; price: number[]; discountPercentage: number; sex: 'мужской'|'женский'|'унисекс'; thumbnail: string; }

const productsStr=JSON.stringify(products);
const productsObj=JSON.parse(productsStr);

export class Filters {
    private filters: HTMLElement|null;
    private productsDefault:IProduct[];
    private productsFiltered:IProduct[];
    private brands:string[];
    private brandsView:string[];
    private family:string[];
    private familyView:string[];
    minPrice:number;
    maxPrice:number;
    private minChosenPrice:number;
    private maxChosenPrice:number;
    minSize:number;
    maxSize:number;
    private minChosenSize:number;
    private maxChosenSize:number;

    constructor() {
        this.filters=document.querySelector('.filters');
        this.productsDefault=productsObj.default;
        this.productsFiltered=[];
        this.brands=[];
        this.brandsView=[];
        this.family=[];
        this.familyView=[];
        this.minPrice=0;
        this.maxPrice=0;
        this.minChosenPrice=this.minPrice;
        this.maxChosenPrice=this.maxPrice;
        this.minSize=0;
        this.maxSize=0;
        this.minChosenSize=this.minSize;
        this.maxChosenSize=this.minSize;
    }

    beforeRender() {
        this.minPrice=this.productsDefault[0].price[0];
        this.maxPrice=this.productsDefault[0].price[this.productsDefault[0].size.length-1];
        this.minSize=this.productsDefault[0].size[0];
        this.maxSize=this.productsDefault[0].size[this.productsDefault[0].size.length-1];
        for(let i=0; i<this.productsDefault.length; i++) {
        this.brands.push(this.productsDefault[i].brand);
        this.family.push(this.productsDefault[i].family);
        if(this.minPrice>this.productsDefault[i].price[0]) {
            this.minPrice=this.productsDefault[i].price[0];
            this.minChosenPrice=this.productsDefault[i].price[0];
        }
        if(this.maxPrice<this.productsDefault[i].price[this.productsDefault[i].price.length-1]) {
            this.maxPrice=this.productsDefault[i].price[this.productsDefault[i].price.length-1];
            this.maxChosenPrice=this.productsDefault[i].price[this.productsDefault[i].price.length-1];
        }
        if(this.minSize>this.productsDefault[i].size[0]) {
            this.minSize=this.productsDefault[i].size[0];
            this.minChosenSize=this.productsDefault[i].size[0];
        }
        if(this.maxSize<this.productsDefault[i].size[this.productsDefault[i].size.length-1]) {
            this.maxSize=this.productsDefault[i].size[this.productsDefault[i].size.length-1];
            this.maxChosenSize=this.productsDefault[i].size[this.productsDefault[i].size.length-1];
        }
        };

        this.renderSex();
        this.renderBrands();
        this.renderFamily();
        this.renderPrice();
        this.renderSize();

    }

    renderSex () {
        (document.querySelector('#filter-sex') as HTMLElement)
        .innerHTML=`
                <div>
                    <input type="checkbox" class="checkbox" name="женский" id="женский">
                    <label for="женский" class="checkbox__label">Женский</label>
                </div>  
                <div>
                    <input type="checkbox" class="checkbox" name="мужской" id="мужской">
                    <label for="мужской" class="checkbox__label">Мужской</label>
                </div>  
                <div>
                    <input type="checkbox" class="checkbox" name="унисекс" id="унисекс">
                    <label for="унисекс" class="checkbox__label">Унисекс</label>
                </div>   
    `  
    }

    renderBrands() {
        
        let brandsSet = new Set(this.brands);
        this.brands=Array.from(brandsSet).sort((a:string, b:string) =>  {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        });
      
        for(let i=0; i<this.brands.length; i++) {
            this.brandsView.push(`
            <div>
            <input type="checkbox" class="checkbox" name="${this.brands[i]}" id="${this.brands[i]}" >
            <label for="${this.brands[i]}" class="checkbox__label">${this.brands[i]}</label>
            </div>
            `
            )}
        (document.querySelector('#filter-brand') as HTMLElement)
        .innerHTML=this.brandsView.join('\n')
        
    }

    renderFamily() {
       this.family=this.family.join(' ').split(' ')
        let familySet = new Set(this.family);
        this.family=Array.from(familySet).sort((a:string, b:string) =>  {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        });
      
        for(let i=0; i<this.family.length; i++) {
            this.familyView.push(`
            <div>
            <input type="checkbox" class="checkbox" name="${this.family[i]}" id="${this.family[i]}">
            <label for="${this.family[i]}" class="checkbox__label">${this.family[i]}</label>
            </div>
            `
            )}
        (document.querySelector('#filter-family') as HTMLElement)
        .innerHTML=this.familyView.join('\n')
        
    }
    renderPrice() {
        (document.querySelector('#filter-price') as HTMLElement)
        .innerHTML=`
            <div class="range-slider">
            <input type="range" min="${this.minPrice}" max="${this.maxPrice}"  value="${this.minChosenPrice}" class="slider" id="price-min-range">
            <input type="range" min="${this.minPrice}" max="${this.maxPrice}" value="${this.maxChosenPrice}" class="slider" id="price-max-range">
            <div class="range-slider__inputs">
            <input type="text" class="price__input" id="price-min-input" value="${this.minChosenPrice}">
            <span> &#8212; </span>
            <input type="text" class="price__input" id="price-max-input"value="${this.maxChosenPrice}">
            <span> руб.</span>
            </div>
            </div>
        ` 
        
    }   

    rangePrice(minChosenPrice:number, maxChosenPrice:number) {
        if(minChosenPrice<maxChosenPrice) {
            this.minChosenPrice=minChosenPrice;
            this.maxChosenPrice=maxChosenPrice
        };
        if(minChosenPrice>maxChosenPrice) {
            this.minChosenPrice=maxChosenPrice;
            this.maxChosenPrice=minChosenPrice;
        }
        (document.querySelector('#price-min-input') as HTMLInputElement).value=this.minChosenPrice.toString();
        (document.querySelector('#price-max-input') as HTMLInputElement).value=this.maxChosenPrice.toString();
        (document.querySelector('#price-min-range') as HTMLInputElement).value=this.minChosenPrice.toString();
        (document.querySelector('#price-max-range') as HTMLInputElement).value=this.maxChosenPrice.toString();
    }

    renderSize() {
        (document.querySelector('#filter-size') as HTMLElement)
        .innerHTML=`
            <div class="range-slider">
            <input type="range" min="${this.minSize}" max="${this.maxSize}" step="5" value="${this.minChosenSize}" class="slider" id="size-min-range">
            <input type="range" min="${this.minSize}" max="${this.maxSize}"  step="5" value="${this.maxChosenSize}" class="slider" id="size-max-range">
            <div class="range-slider__inputs">
            <input type="text" class="price__input" id="size-min-input" value="${this.minChosenSize}">
            <span> &#8212; </span>
            <input type="text" class="price__input" id="size-max-input" value="${this.maxChosenSize}">
            <span> мл </span>
            </div>
            </div>
        ` 
    }

    rangeSize(minChosenSize:number, maxChosenSize:number) {
        if(minChosenSize<maxChosenSize) {
            this.minChosenSize=minChosenSize;
            this.maxChosenSize=maxChosenSize;
        };
        if(minChosenSize>maxChosenSize) {
            this.minChosenSize=maxChosenSize;
            this.maxChosenSize=minChosenSize;
        }
        (document.querySelector('#size-min-input') as HTMLInputElement).value=this.minChosenSize.toString();
        (document.querySelector('#size-max-input') as HTMLInputElement).value=this.maxChosenSize.toString();
        (document.querySelector('#size-min-range') as HTMLInputElement).value=this.minChosenSize.toString();
        (document.querySelector('#size-max-range') as HTMLInputElement).value=this.maxChosenSize.toString();
    }

    filter(filters:[[string[], string[], string[]], number[]]) {
        this.productsFiltered=[];
        let temporaryFiltered: IProduct[]=[];
        if(filters[0][0].length!=0) {
            for(let i=0; i<this.productsDefault.length; i++) {
                for(let j=0; j<filters[0][0].length; j++) {
                    if(this.productsDefault[i].sex ==filters[0][0][j]) {
                        this.productsFiltered.push(this.productsDefault[i]);
                    }   
                }
            }
            if(this.productsFiltered.length==0) {return this.productsFiltered }
        }

        if(filters[0][1].length!=0){
            if(this.productsFiltered.length!=0){
                temporaryFiltered=Object.assign([], this.productsFiltered);
            } else {
                temporaryFiltered=Object.assign([], this.productsDefault);
            }
            this.productsFiltered=[];
            for(let i=0; i<temporaryFiltered.length; i++) {
                    for(let j=0; j<filters[0][1].length; j++) {
                        if(temporaryFiltered[i].brand ==filters[0][1][j]) {
                            this.productsFiltered.push(temporaryFiltered[i]);
                        }   
                    }
                }
                if(this.productsFiltered.length==0) {return this.productsFiltered }
        }

        if(filters[0][2].length!=0){
            if(this.productsFiltered.length!=0){
                temporaryFiltered=Object.assign([], this.productsFiltered);
            } else {
                temporaryFiltered=Object.assign([], this.productsDefault);
            }
            this.productsFiltered=[];
            for(let i=0; i<temporaryFiltered.length; i++) {
                    for(let j=0; j<filters[0][2].length; j++) {
                        if(temporaryFiltered[i].family.includes(filters[0][2][j])) {
                            this.productsFiltered.push(temporaryFiltered[i]);
                        }   
                    }
                }
            if(this.productsFiltered.length==0) {return this.productsFiltered }
        }
        if(filters[1][0]!=0 || filters[1][1]!=0){
            if(this.productsFiltered.length!=0){
                temporaryFiltered=Object.assign([], this.productsFiltered);
            } else {
                temporaryFiltered=Object.assign([], this.productsDefault);
            }
            this.productsFiltered=[];
            for(let i=0; i<temporaryFiltered.length; i++) {
                for(let j=0; j<temporaryFiltered[i].price.length; j++){
                    if(temporaryFiltered[i].price[j]>=filters[1][0] && 
                        temporaryFiltered[i].price[j]<=filters[1][1]) {
                        this.productsFiltered.push(temporaryFiltered[i]);
                        break;
                }  
            }
        }
        if(this.productsFiltered.length==0) {return this.productsFiltered }
        }

        if(filters[1][2]!=0 || filters[1][3]!=0){
            if(this.productsFiltered.length!=0){
                temporaryFiltered=Object.assign([], this.productsFiltered);
            } else {
                temporaryFiltered=Object.assign([], this.productsDefault);
            }
            this.productsFiltered=[];
            for(let i=0; i<temporaryFiltered.length; i++) {
                for(let j=0; j<temporaryFiltered[i].size.length; j++){
                    if(temporaryFiltered[i].size[j]>=filters[1][2] && 
                        temporaryFiltered[i].size[j]<=filters[1][3]){
                            if(temporaryFiltered[i].price[j]>=filters[1][0] && 
                                temporaryFiltered[i].price[j]<=filters[1][1]){
                                    this.productsFiltered.push(temporaryFiltered[i]);
                                   break
                                }
                                   
                            }  
                           
                        }
            
                    }
                    if(this.productsFiltered.length==0) {return this.productsFiltered }
                 }
        return this.productsFiltered   
    }
}
import { Linter } from 'eslint';
import * as products from '../../data/data.json' assert {type: 'json'};
import './catalog.css'
import {Cart} from '../../components/cart/cart'
import { Filters } from '../filters/filters';
import { Card } from '../card-details/card';


export interface IProduct { id: number; title: string; brand: string; description: string; family: string; size: number[]; price: number[]; discountPercentage: number; sex: 'мужской'|'женский'|'унисекс'; thumbnail: string; }

const productsStr=JSON.stringify(products);
const productsObj=JSON.parse(productsStr);

export class Catalog {
    private loading = false;
    private error: Error | null = null;
    productsDefault: IProduct[] = [];
    private productsFiltered: IProduct[] = []
    private productsSorted:IProduct[] = [];
    private productsFavourite: IProduct[] = [];
    catalogView: string[];
    private sorted:boolean;
    private sortMethod: "byName"|"byPopularity"|"byMinPrice"|"byMaxPrice";
    private searched:boolean;
    private searchValue: string;
    private filtered:boolean;
    private view:'big'|'small';
    cart: Cart;
    card: Card;
    private filters:Filters;
    params:URLSearchParams;
    inputsChecked:[[string[], string[], string[]], number[]];
    url:string;

 constructor(){
    this.cart= new Cart();
    this.filters= new Filters();
    this.card=new Card();
    this.catalogView=[];
    this.productsDefault=productsObj.default;
    this.productsFiltered=[];
    this.productsSorted=Object.assign([], this.productsDefault);
    this.productsFavourite=[];
    this.sorted=false; 
    this.sortMethod="byPopularity";
    this.searched=false; 
    this.searchValue="";
    this.filtered=false;
    this.view="big";
    this.params = new URLSearchParams(location.search);
    this.inputsChecked=[[[], [], []], [0, 100000, 0, 0]];
    this.url='https://github.com/ksu1ven/online-store';
    }
    
    getQueryParams(times:string){
        let queries:string[]=location.search.substr(1).split('&');
        if(queries[0]!==''){
            for(let i=0; i<queries.length; i++){
                let key=queries[i].split('=')[0];
                let value=queries[i].split('=')[1];
                if(key=='sex'){
                    if(times=='first'){
                        this.inputsChecked[0][0].push(decodeURI(value));
                        this.params.append('sex', decodeURI(value)); 
                    }
                    (document.querySelector(`#${decodeURI(value)}`) as HTMLInputElement).checked=true
                };
                if(key=='brand'){
                    if(times=='first'){
                        this.inputsChecked[0][1].push(decodeURI(value).split('+').join(' '));
                        this.params.append('brand', decodeURI(value).split('+').join(' '));
                    }
                    (document.querySelector(`input[name='${decodeURI(value).split('+').join(' ')}']`) as HTMLInputElement).checked=true
                };
                if(key=='family'){
                    if(times=="first"){
                        this.inputsChecked[0][2].push(decodeURI(value));
                        this.params.append('family', decodeURI(value));
                    }
                    (document.querySelector(`#${decodeURI(value)}`) as HTMLInputElement).checked=true
                };
                if(key=='minprice'){
                    this.inputsChecked[1][0]=+value;
                    this.params.set('minprice', value);
                    if(this.params.has('minprice') && this.params.has('maxprice')) {
                        this.filters.rangePrice(+(this.params.get('minprice') as String), +(this.params.get('maxprice') as String))
                    }      
                };
                if(key=='maxprice'){
                    this.inputsChecked[1][1]=+value;
                    this.params.set('maxprice', value);
                    if(this.params.has('minprice') && this.params.has('maxprice')) {
                        this.filters.rangePrice(+(this.params.get('minprice') as String), +(this.params.get('maxprice') as String))
                    }  
                }
                if(key=='minsize'){
                    this.inputsChecked[1][2]=+value;
                    this.params.set('minsize', value);
                    if(this.params.has('minsize') && this.params.has('maxsize')) {
                        this.filters.rangeSize(+(this.params.get('minsize') as String), +(this.params.get('maxsize') as String))
                    }   
                }
                if(key=='maxsize'){
                    this.inputsChecked[1][3]=+value;
                    this.params.set('maxsize', value);
                    if(this.params.has('minsize') && this.params.has('maxsize')) {
                        this.filters.rangeSize(+(this.params.get('minsize') as String), +(this.params.get('maxsize') as String))
                    }
                }
                if(key=='search'){
                    this.params.set('search', value);
                    this.search(value)
                }
                if(key=='sort'){
                    this.params.set('sort', value);
                    if(value=="byName"|| value=="byPopularity"||value=="byMinPrice"||value=="byMaxPrice"){
                        this.sort(value)
                    }   
                }
                if(key=='page-size'){
                    this.params.set('page-size', value);
                    if(value=="small"|| value=="big"){
                        this.changeView(value)
                    }   
                }
            }
            if(times=='first'){
                let filteredArr=this.filters.filter(this.inputsChecked);
            }
            
        }
        

    }

    renderframe(){
        (document.querySelector('main') as HTMLElement).innerHTML=`
        <aside>
            <div class="filters">
            <div class="filters__top-buttons">
                <button id="reset-filters__btn" type="reset">Сбросить фильтры</button>
                <button id="copy-link__btn" type="summit">Скопировать ссылку</button>
            </div> 
            <h3 class="filters__h3">Для кого:</h3>
            <div id="filter-sex">
            </div>
            <h3 class="filters__h3">Бренд:</h3>  
            <div id="filter-brand">
            </div>
            <h3 class="filters__h3">Семейство аромата:</h3>  
            <div id="filter-family">
            </div>
            <h3 class="filters__h3">Цена:</h3>  
            <div id="filter-price"> 
            </div>
            <h3 class="filters__h3">Объём:</h3>  
            <div id="filter-size"> 
            </div>
           </div>
        </aside>
        <section class="catalog">
            <div class="parameters-line">
                <div class="dropdown">
                <button class="dropbtn">По популярности &#9660;</button>
                <div class="dropdown-content">
                  <a href="#" id="byPopularity">По популярности</a>
                  <a href="#" id="byName">По наименованию</a>
                  <a href="#" id="byMinPrice">По цене min</a>
                  <a href="#" id="byMaxPrice">По цене max</a>
                </div>
                </div>
                <form class="search">
                    <input type="text" placeholder="Поиск" class="search__input">
                    <label for="search__input" class="search__label"></label>
                    <button class="reset__btn" type="reset"></button>
                    <button class="search__btn" type="submit"></button>
                </form>
                <button type="submit" id="dots-small"></button>
                <button type="submit dots_active" id="dots-big"></button>
            </div>
            <div class="cards"> 
            </div>
        </section>`
        this.filters.beforeRender();
    }

    render(catalog: 'products'|'favourite') {

        (document.querySelector('.cards') as HTMLElement)?.replaceChildren();
        this.catalogView=[];
        let products:IProduct[];
        if(catalog=='favourite'){
            console.log(JSON.parse(localStorage.getItem('favourite')))
            products=this.productsFavourite}
        else if (this.sorted ==false && this.searched ==false && this.filtered ==false) {
            products=this.productsDefault;
        } 
        else {
            products=this.productsSorted;
        }
        for (let i=0; i<products.length; i++) {
            this.catalogView.push(`
            <div class='card' id="${products[i].id}">
            <div class='thumbnail' style="background-image: url(./img/${products[i].id}/${products[i].id}.jpg)">
            </div>
            <h2>${products[i].brand} <br> ${products[i].title}</h2>
            <p class='size'>Объём, мл: <br><button class="select-size select-size_active">${products[i].size.join('</button><button class="select-size">')}</button></p>
            <p class='price select-price_active'>${products[i].price.join(' руб.</p><p class="price none">')} руб.</p>
            <btn class="cart__btn"></btn>
            <btn class="favourite__btn"></btn>;
            </div>
            `  
        )
        }
        if( (document.querySelector('.cards') as HTMLElement)) { 
            (document.querySelector('.search__label') as HTMLElement).innerHTML=`Найдено ароматов : ${products.length}`;
            if(this.catalogView.length==0){
                (document.querySelector('.cards') as HTMLElement).classList.add('noproducts')
            }  else{
                (document.querySelector('.cards') as HTMLElement).classList.remove('noproducts');
                (document.querySelector('.cards') as HTMLElement).innerHTML=this.catalogView.join('\n');
            } 

            this.changeView(this.view);
            this.addCardsEvents();
            this.productsFavourite=JSON.parse(localStorage.getItem('favourite'))
            this.cart.showItemsFavourite(this.productsFavourite);
            if(+localStorage.getItem("counterPurchases")>0) {
                this.cart.showItemsInCart();
                this.cart.renderMiniCart();

            }    
        }

    }

    addCardsEvents(){
        let cards=document.querySelectorAll(".card");
        
         cards.forEach((card) => {card.addEventListener('click', (e) => {
            let target=e.target as HTMLElement;
            if(target.classList.contains('select-size')) {
                let sizes=card.querySelectorAll(".select-size");
                let prices=card.querySelectorAll(".price");
                sizes.forEach((el)=> el.classList.remove('select-size_active'));
                target.classList.add('select-size_active');
                prices.forEach((el)=> {el.classList.add('none');
                el.classList.remove('select-price_active')});
                prices[[...sizes].indexOf(target)].classList.remove('none');
                prices[[...sizes].indexOf(target)].classList.add('select-price_active');

            }

            else if(target.classList.contains('cart__btn')) {
                let cartButton=card.querySelector(".cart__btn");
                cartButton?.classList.add('cart__btn_active');
                let selectedPerfume=card.querySelector('h2')?.innerHTML;
                let selectedSize=card.querySelector('.select-size_active')?.innerHTML;
                let selectedPrice=card.querySelector('.select-price_active')?.innerHTML;
                if(selectedSize && selectedPrice && selectedPerfume) {
                    this.cart.putInCart(card.id, selectedPerfume, selectedSize, selectedPrice, 1);   
                }           
                }

            else if(target.classList.contains('favourite__btn')) {
                let favouriteButton=card.querySelector(".favourite__btn");
                 favouriteButton?.classList.toggle('favourite__btn_active');
                    if(favouriteButton?.classList.contains('favourite__btn_active')) {
                        console.log('add')
                        this.cart.putInFavourite();
                        for(let i=0; i<this.productsDefault.length; i++) {
                            if(+card.id==this.productsDefault[i].id) {
                                this.productsFavourite.push(this.productsDefault[i]);
                                localStorage.setItem("favourite", JSON.stringify(this.productsFavourite));
                            }
                        }
                
                    } else {
                        this.cart.takeFromFavourite();
                        for(let i=0; i<this.productsFavourite.length; i++) {
                            if(+card.id==this.productsFavourite[i].id) {
                                this.productsFavourite.splice(i, 1);
                                console.log(this.productsFavourite)
                                localStorage.setItem("favourite", JSON.stringify(this.productsFavourite));
                                console.log(JSON.parse(localStorage.getItem("favourite")))
                            }
                        }
                    }
            }

            else{
                window.history.replaceState({}, '', `${this.url}/product-details/${card.id}`)
                this.goToCard(card.id)
            }
        })
        });

        document.querySelector('.go-to-cart__btn')?.addEventListener('click', ()=> {
            window.history.replaceState({}, '', `${this.url}/cart`);
                this.cart.renderCartFrame();
               this.cart.renderCart();
            });
    }

    addCatalogEvents() {
       
        document.querySelector('.dropdown-content')?.addEventListener('click', (e) => {
            let target=e.target as HTMLElement;
            this.params.set('sort', target.id);
            this.writeQueryParams();
            if(target.id==="byName"||target.id==="byPopularity"||target.id==="byMinPrice"||target.id==="byMaxPrice"){
            this.sort(target.id)}
        }
        );

        document.querySelector('.search')?.addEventListener('submit', (e) => {
            e.preventDefault();
            let input=document.querySelector('.search__input') as HTMLInputElement;
            this.params.set('search', input.value);
            this.writeQueryParams()
            this.search(input.value);
            });

        document.querySelector('.search')?.addEventListener('reset', (e) => {
            e.preventDefault();
            let input=document.querySelector('.search__input') as HTMLInputElement;
            input.value='';
            this.search('');
            this.params.delete('search');    
            this.writeQueryParams()   
            });
           
        document.querySelector('#price-min-range')?.addEventListener('change', (e)=> {
            let minChosenPrice=(document.querySelector('#price-min-range') as HTMLInputElement).value;
            let maxChosenPrice=(document.querySelector('#price-max-range') as HTMLInputElement).value;
            this.inputsChecked[1][0]=+minChosenPrice;
            this.inputsChecked[1][1]=+maxChosenPrice;
            this.params.set('minprice', minChosenPrice);
            this.params.set('maxprice', maxChosenPrice);
            this.writeQueryParams();
            let filteredArr=this.filters.filter(this.inputsChecked);
            this.filter(filteredArr)
            this.filters.rangePrice(+minChosenPrice, +maxChosenPrice)});

        document.querySelector('#price-max-range')?.addEventListener('change', (e)=> {
            let minChosenPrice=(document.querySelector('#price-min-range') as HTMLInputElement).value;
            let maxChosenPrice=(document.querySelector('#price-max-range') as HTMLInputElement).value;
            this.inputsChecked[1][0]=+minChosenPrice;
            this.inputsChecked[1][1]=+maxChosenPrice;
            this.params.set('minprice', minChosenPrice);
            this.params.set('maxprice', maxChosenPrice);
            this.writeQueryParams();
            let filteredArr=this.filters.filter(this.inputsChecked);
            this.filter(filteredArr)
            this.filters.rangePrice(+minChosenPrice, +maxChosenPrice)});
        
         document.querySelector('#price-min-input')?.addEventListener('change', (e)=> {
            let minChosenPrice=(document.querySelector('#price-min-input') as HTMLInputElement).value;
            let maxChosenPrice=(document.querySelector('#price-max-input') as HTMLInputElement).value;
            this.params.set('minprice', minChosenPrice);
            this.params.set('maxprice', maxChosenPrice);
            this.writeQueryParams();
            this.inputsChecked[1][0]=+minChosenPrice;
            this.inputsChecked[1][1]=+maxChosenPrice;
            let filteredArr=this.filters.filter(this.inputsChecked);
            this.filter(filteredArr)
            this.filters.rangePrice(+minChosenPrice, +maxChosenPrice)});
        
         document.querySelector('#price-max-input')?.addEventListener('change', (e)=> {
            let minChosenPrice=(document.querySelector('#price-min-input') as HTMLInputElement).value;
            let maxChosenPrice=(document.querySelector('#price-max-input') as HTMLInputElement).value;
            this.inputsChecked[1][0]=+minChosenPrice;
            this.inputsChecked[1][1]=+maxChosenPrice;
            this.params.set('minprice', minChosenPrice);
            this.params.set('maxprice', maxChosenPrice);
            this.writeQueryParams();
            let filteredArr=this.filters.filter(this.inputsChecked);
            this.filter(filteredArr)
            this.filters.rangePrice(+minChosenPrice, +maxChosenPrice)});
        
        document.querySelector('#size-min-range')?.addEventListener('change', (e)=> {
            let minChosenSize=(document.querySelector('#size-min-range') as HTMLInputElement).value;
            let maxChosenSize=(document.querySelector('#size-max-range') as HTMLInputElement).value;
            this.inputsChecked[1][2]=+minChosenSize;
            this.inputsChecked[1][3]=+maxChosenSize;
            this.params.set('minsize', minChosenSize);
            this.params.set('maxsize', maxChosenSize);
            this.writeQueryParams();
            let filteredArr=this.filters.filter(this.inputsChecked);
            this.filter(filteredArr)
            this.filters.rangeSize(+minChosenSize, +maxChosenSize)});

        document.querySelector('#size-max-range')?.addEventListener('change', (e)=> {
            let minChosenSize=(document.querySelector('#size-min-range') as HTMLInputElement).value;
            let maxChosenSize=(document.querySelector('#size-max-range') as HTMLInputElement).value;
            this.inputsChecked[1][2]=+minChosenSize;
            this.inputsChecked[1][3]=+maxChosenSize;
            this.params.set('minsize', minChosenSize);
            this.params.set('maxsize', maxChosenSize);
            this.writeQueryParams();
            let filteredArr=this.filters.filter(this.inputsChecked);
            this.filter(filteredArr)
            this.filters.rangeSize(+minChosenSize, +maxChosenSize)});
        
         document.querySelector('#size-min-input')?.addEventListener('change', (e)=> {
            let minChosenSize=(document.querySelector('#size-min-input') as HTMLInputElement).value;
            let maxChosenSize=(document.querySelector('#size-max-input') as HTMLInputElement).value;
            this.inputsChecked[1][2]=+minChosenSize;
            this.inputsChecked[1][3]=+maxChosenSize;
            this.params.set('minsize', minChosenSize);
            this.params.set('maxsize', maxChosenSize);
            this.writeQueryParams();
            let filteredArr=this.filters.filter(this.inputsChecked);
            this.filter(filteredArr)
            this.filters.rangeSize(+minChosenSize, +maxChosenSize)});
        
         document.querySelector('#size-max-input')?.addEventListener('change', (e)=> {
            let minChosenSize=(document.querySelector('#size-min-input') as HTMLInputElement).value;
            let maxChosenSize=(document.querySelector('#size-max-input') as HTMLInputElement).value;
            this.inputsChecked[1][2]=+minChosenSize;
            this.inputsChecked[1][3]=+maxChosenSize;
            this.params.set('minsize', minChosenSize);
            this.params.set('maxsize', maxChosenSize);
            this.writeQueryParams();
            let filteredArr=this.filters.filter(this.inputsChecked);
            this.filter(filteredArr)
            this.filters.rangeSize(+minChosenSize, +maxChosenSize)});

        const inputsCheckbox = document.querySelectorAll(".checkbox");
        inputsCheckbox.forEach(el => {
            
            el.addEventListener("click", () => {
                this.inputsChecked[0]=[[], [], []];
                this.params.delete('sex');
                this.params.delete('brand');
                this.params.delete('family')

            let inputs = document.querySelectorAll("input:checked");
            inputs.forEach((el) => {
                if(el.parentElement?.parentElement?.id=='filter-sex') {
                    this.inputsChecked[0][0].push(el.id);
                    this.params.append('sex', el.id);
                }
                if(el.parentElement?.parentElement?.id=='filter-brand') {
                    this.inputsChecked[0][1].push(el.id);
                    this.params.append('brand', el.id);
                }
                if(el.parentElement?.parentElement?.id=='filter-family') {
                    this.inputsChecked[0][2].push(el.id);
                    this.params.append('family', el.id);
                }
                 
            })
            this.writeQueryParams();
            let filteredArr=this.filters.filter(this.inputsChecked);
            this.filter(filteredArr)
        })
        });

        document.querySelector('#reset-filters__btn')?.addEventListener('click', ()=> {
            let inputs = document.querySelectorAll("input:checked") as  NodeListOf<HTMLInputElement>;
            inputs.forEach((input)=> input.checked=false);
            this.params.delete('sex');
            this.params.delete('brand');
            this.params.delete('family');
            this.params.delete('minprice');
            this.params.delete('maxprice');
            this.params.delete('minsize');
            this.params.delete('maxsize');
            this.writeQueryParams();
            this.filters.rangePrice(this.filters.minPrice, this.filters.maxPrice);
            this.filters.rangeSize(this.filters.minSize, this.filters.maxSize);
            this.filter(this.productsDefault);
            
        });

        document.querySelector('#copy-link__btn')?.addEventListener('click', ()=> {
        (document.querySelector('#copy-link__btn') as HTMLElement).innerHTML='Cкопирована!';
        let tempInput = document.createElement('textarea');
		tempInput.style.border = '0';
		tempInput.style.padding = '0';
		tempInput.style.margin = '0';
		tempInput.style.position = 'absolute';
		tempInput.style.left = '-9999px';
		tempInput.setAttribute('readonly', '');
        tempInput.value = window.location.href;
        ((document.querySelector('#copy-link__btn') as Node).parentNode as Node).appendChild(tempInput);
        tempInput.select();
		tempInput.setSelectionRange(0, 99999);
        document.execCommand('copy');
        (tempInput.parentNode as Node).removeChild(tempInput);  
        setTimeout(()=>(document.querySelector('#copy-link__btn') as HTMLElement).innerHTML='Скопировать ссылку', 1500)
        });

        document.querySelector('#dots-small')?.addEventListener('click', ():void=> {this.changeView("small");
        this.params.set('page-size', 'small');
        this.writeQueryParams()     
            
    });
        document.querySelector('#dots-big')?.addEventListener('click', ():void=> {this.changeView("big");
        this.params.delete('page-size');    
        this.writeQueryParams()   
    });   
     }   

     writeQueryParams() {
        if(this.params.has('sex')||this.params.has('page-size')||this.params.has('minprice')||
        this.params.has('maxprice')||this.params.has('maxsize')||this.params.has('search')||
        this.params.has('brand')||this.params.has('family')||this.params.has('maxsize')||
        this.params.has('sort')){
            window.history.replaceState({}, '', `${this.url}?${this.params}`); 
        } else {
            window.history.replaceState({}, '', `${this.url}`)
        }
    }

    sort(sortMethod: "byName"|"byPopularity"|"byMinPrice"|"byMaxPrice") {        
        this.sortMethod=sortMethod;
        let sortbtn= document.querySelector('.dropbtn') as HTMLElement
        if(this.sortMethod==="byName"){
            this.sorted=true;
            sortbtn.innerHTML='По наименованию &#9660;';
            this.productsSorted.sort((a, b):number=> {
                if (a.brand > b.brand) return 1;
                else if (a.brand < b.brand) return -1;
                else {
                    if (a.title > b.title) return 1;
                    if (a.title < b.title) return -1;
                };
                return 0
            });
        this.render('products')
        };

        if(this.sortMethod==="byMinPrice"){
            this.sorted=true;
            sortbtn.innerHTML='По цене min &#9660;';
            this.productsSorted.sort((a, b) => a.price[0] - b.price[0]);
        this.render('products')
        };

        if(this.sortMethod==="byMaxPrice"){
            this.sorted=true;
            sortbtn.innerHTML='По цене max &#9660;';
            this.productsSorted.sort((a, b) => b.price[0] - a.price[0]);
        this.render('products')
        };

        if(this.sortMethod==="byPopularity"){
        this.sorted=false;
        sortbtn.innerHTML='По популярности &#9660;';
        this.render('products')
        }

    };
    
    search(value:string){
        this.searchValue=value;
        let products:IProduct[];
        let label=document.querySelector('.search__label') as HTMLElement;
        if(value=='') {
            this.searched=false;
            if(this.filtered==true) {
                this.productsSorted=Object.assign([], this.productsFiltered);
                label.innerHTML=`Найдено ароматов : ${this.productsSorted.length}`
            }
            else {
                label.innerHTML=''
                this.productsSorted=Object.assign([], this.productsDefault);}
            
            if(this.sorted==false) {this.render('products')}
            if(this.sorted==true) {this.sort(this.sortMethod)
            }
        }
        else {
            this.searched=true;
            this.productsSorted=[];
            if(this.filtered==false) {
                for(let i=0; i<this.productsDefault.length; i++) {
                    if(this.productsDefault[i].title.toLowerCase().indexOf(value.toLowerCase()) ==0 || 
                        this.productsDefault[i].brand.toLowerCase().indexOf(value.toLowerCase()) ==0) {
                        this.productsSorted.push(this.productsDefault[i])
                    }
                }
            }
            if(this.filtered==true) {
                for(let i=0; i<this.productsFiltered.length; i++) {
                    if(this.productsFiltered[i].title.toLowerCase().indexOf(value.toLowerCase()) ==0 || 
                        this.productsFiltered[i].brand.toLowerCase().indexOf(value.toLowerCase()) ==0) {
                        this.productsSorted.push(this.productsFiltered[i])
                    }
                }
            }
            
            label.innerHTML=`Найдено ароматов : ${this.productsSorted.length}`
            if(this.sorted==false) {this.render('products')}
            if(this.sorted==true) {this.sort(this.sortMethod)}
        }
       
    }

    filter(filteredArr:IProduct[]) {
        let label=document.querySelector('.search__label') as HTMLElement;
        if(filteredArr.length==this.productsDefault.length) {
            this.filtered=false;    
        } else {
            this.filtered=true;
        }
        this.productsFiltered=Object.assign([], filteredArr);
        this.productsSorted=Object.assign([], filteredArr);
        if(this.searched==true) {
            this.search(this.searchValue)
        } else {
            if(this.filtered==false ) {label.innerHTML=''}
            if(this.filtered==true){label.innerHTML=`Найдено ароматов : ${this.productsSorted.length}`}
            this.sort(this.sortMethod)
        }
        
    }

    changeView(view:'big'|'small') {
        if(view==="small") {
            this.view='small';
            document.querySelector('#dots-big')?.classList.remove('dots_active')
            document.querySelector('#dots-small')?.classList.add('dots_active')
            document.querySelector('.cards')?.classList.add('small');
            document.querySelectorAll('.thumbnail').forEach((elem) =>elem?.classList.add('small'));
            document.querySelectorAll('h2').forEach((elem) =>elem?.classList.add('small-text-h2'));
            document.querySelectorAll('.size').forEach((elem) =>elem?.classList.add('small-text'));
            document.querySelectorAll('.select-size').forEach((elem) =>elem?.classList.add('small-btn-select'));
            document.querySelectorAll('.price').forEach((elem) =>elem?.classList.add('small-text-price'));
            document.querySelectorAll('.cart__btn').forEach((elem) =>elem?.classList.add('small-btn'));
            document.querySelectorAll('.favourite__btn').forEach((elem) =>elem?.classList.add('small-btn'));

        } else {
            this.view="big"
            document.querySelector('#dots-big')?.classList.add('dots_active')
            document.querySelector('#dots-small')?.classList.remove('dots_active') 
            document.querySelector('.cards')?.classList.remove('small');
            document.querySelectorAll('.thumbnail').forEach((elem) =>elem?.classList.remove('small'));
            document.querySelectorAll('h2').forEach((elem) =>elem?.classList.remove('small-text-h2'));
            document.querySelectorAll('.size').forEach((elem) =>elem?.classList.remove('small-text'));
            document.querySelectorAll('.select-size').forEach((elem) =>elem?.classList.remove('small-btn-select'));
            document.querySelectorAll('.price').forEach((elem) =>elem?.classList.remove('small-text-price'));
            document.querySelectorAll('.cart__btn').forEach((elem) =>elem?.classList.remove('small-btn'));
            document.querySelectorAll('.favourite__btn').forEach((elem) =>elem?.classList.remove('small-btn'));

        }
        
    }

    goToCard(id){
        this.card.render(id);
        this.cart.renderMiniCart();
        this.card.addCardEvents();
        for(let i=0; i<this.cart.purchases.length; i++){
            const size=document.querySelector('.card-details-size_active')?.firstElementChild.innerHTML.split(' ')[0];
            if(this.cart.purchases[i].id==id && size==this.cart.purchases[i].size){
                (document.querySelector('#put-in-cart') as HTMLElement).innerHTML='В корзине';
            }
        }

        document.querySelectorAll('.card-details-size')?.forEach((elem)=>{
            elem.addEventListener('click', ()=>{
                document.querySelectorAll('.card-details-size').forEach(el => {
                el.classList.remove('card-details-size_active')});
                elem.classList.add('card-details-size_active');
                for(let i=0; i<this.cart.purchases.length; i++){
                    const id=document.querySelector('.card-details').id;
                    const size=document.querySelector('.card-details-size_active')?.firstElementChild.innerHTML.split(' ')[0];
                    if(this.cart.purchases[i].id==id && size==this.cart.purchases[i].size){
                        (document.querySelector('#put-in-cart') as HTMLElement).innerHTML='В корзине';
                        break;
                    }
                    if(i==this.cart.purchases.length-1 && this.cart.purchases[i].size!=size){
                        (document.querySelector('#put-in-cart') as HTMLElement).innerHTML='В корзину';
                    }
                }
            })
        });
        document.querySelector('#put-in-cart')?.addEventListener('click', ()=>{
            let size=document.querySelector('.card-details-size_active').firstElementChild.innerHTML.split(' ')[0];
            let price=document.querySelector('.card-details-size_active').lastElementChild.innerHTML.split(' ')[0]+" руб.";
            let perfume=document.querySelector('.card-details__h2').innerHTML;
            (document.querySelector('#put-in-cart') as HTMLElement).innerHTML='В корзине';
            this.cart.putInCart(id, perfume, size, price, 1)
        });
        document.querySelector('#buy-now')?.addEventListener('click', ()=>{
            let size=document.querySelector('.card-details-size_active').firstElementChild.innerHTML.split(' ')[0];
            let price=document.querySelector('.card-details-size_active').lastElementChild.innerHTML.split(' ')[0]+" руб.";
            let perfume=document.querySelector('.card-details__h2').innerHTML;
            (document.querySelector('#put-in-cart') as HTMLElement).innerHTML='В корзине';
            this.cart.putInCart(id, perfume, size, price, 1);
            window.history.replaceState({}, '', `${this.url}/cart`);
            this.cart.renderCartFrame();
            this.cart.renderCart();
            this.cart.addBigCartEvents();
            (document.querySelector('.mini-cart') as HTMLElement).innerHTML='';
            (document.querySelector('.modal') as HTMLElement).classList.remove('none');
            (document.querySelector('.darken') as HTMLElement).classList.remove('none');
            document.querySelector('#confirm').addEventListener('click', (e)=> {
            e.preventDefault();
            this.redirect()          
        });
        })
    }
    redirect(){
        document.querySelectorAll('.order__input').forEach((el)=> {
            if((el as HTMLInputElement).value==''){el.parentElement.lastElementChild.classList.add('visible');
            el.classList.add('err__input')
        }
        })
        if(document.querySelectorAll('.err__input').length>0) return
        let seconds=5;
        document.querySelector('.darken')?.remove();
        document.querySelector('.modal')?.remove();
        document.querySelector('main').innerHTML=`
        <div class="redirect"><h2 class="redirect__h2">Спасибо за заказ! Вы будете перенаправлены через ${seconds} секунд</h2>
        </div>   
        `
        let timer= setInterval(() =>{
            seconds--;
            document.querySelector('main').innerHTML=`
            <div class="redirect"><h2 class="redirect__h2">Спасибо за заказ! Вы будете перенаправлены через ${seconds} секунд</h2>
            </div>   
            `
        }, 1000);
        setTimeout(() => { clearInterval(timer);            
            window.history.replaceState({}, '', `${this.cart}`);
            (document.querySelector('main') as HTMLElement).classList.remove('nocart');
            this.cart.removeAllFromCart();
            this.writeQueryParams();
            this.renderframe();
            this.render('products');
            this.addCatalogEvents();
            (document.querySelector('.cart__round') as HTMLElement).classList.add('hidden');
             
        }, 5000);
    }
    


}

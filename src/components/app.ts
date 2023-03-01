import { Cart } from "./cart/cart";
import { Catalog } from "./catalog/catalog";
import { Filters } from "./filters/filters";

export class App {
    private catalog:Catalog;
    private filters:Filters;
    url:string;
    
    constructor() {
        this.catalog = new Catalog();
        this.filters= new Filters();
        this.url='https://github.com/ksu1ven/online-store';
    }
    goToPage(){
        document.querySelector('body').style.visibility='visible'
        document.querySelector('body').classList.remove('page-not-found');
        if(window.location.pathname=='/'){
            this.catalog.renderframe();
            this.catalog.render('products');
            this.catalog.addCatalogEvents();
            this.catalog.getQueryParams('first');
        }
        else if(window.location.pathname=='/cart'){
            this.catalog.cart.renderCartFrame();
            this.catalog.cart.getQueryParams('first');
           this.catalog.cart.renderCart();
           this.catalog.cart.addBigCartEvents();
           (document.querySelector('.mini-cart') as HTMLElement).innerHTML='';
           document.querySelector('#confirm').addEventListener('click', (e)=> {
            e.preventDefault();
            this.catalog.redirect()
            
        })
        }
        else if(window.location.pathname.includes('/product-details')){
            let id=window.location.pathname.split('/')[2];
            this.catalog.goToCard(id);
        }
        else{
            document.querySelector('body').style.visibility='hidden';
            document.querySelector('body').classList.add('page-not-found')
        }
    }

    addEvents() {
       
        document.querySelector('.cart')?.addEventListener('click', (e)=> {
            e.preventDefault();
            window.history.replaceState({}, '', `${this.url}/cart`);
            this.catalog.cart.renderCartFrame();
            this.catalog.cart.params.delete('limit');
            this.catalog.cart.params.delete('page');
            (document.querySelector('.mini-cart') as HTMLElement).innerHTML=''
           this.catalog.cart.renderCart();
           this.catalog.cart.addBigCartEvents();
           document.querySelector('#confirm').addEventListener('click', (e)=> {
            e.preventDefault();
            this.catalog.redirect() 
        })
        });

        document.querySelector('#go-to-catalog')?.addEventListener('click', (e)=> {
            e.preventDefault();
            window.history.replaceState({}, '', `${this.url}`);
            (document.querySelector('main') as HTMLElement).classList.remove('nocart');
            this.catalog.writeQueryParams();
            this.catalog.renderframe();
            this.catalog.render('products');
            this.catalog.addCatalogEvents();
            this.catalog.getQueryParams('second');
           
        });

        document.querySelector('.favourite').addEventListener('click', ()=>{
            this.catalog.render('favourite');
            
        });
        
    }
}
export default App;

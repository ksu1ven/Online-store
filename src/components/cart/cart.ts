import './cart.css'
import {Catalog, IProduct} from '../catalog/catalog'
import { Card } from '../card-details/card';

export class Cart {
    
    purchases:{"id":string, "perfume":string, "size":string, "price":string, "quantity":number}[];
    private purchasesView:string[];
    private purchasesBigView:string[];
    private counterPurchases:number;
    private counterFavourite:number;
    private totalPrice:number;
    private totalDiscountPrice:number;
    private limitProducts:number;
    private pages:number;
    currentPage:number;
    promocodes: {name:string, discount:number}[];
    apliedPromocodes: {name:string, discount:number}[];
    private totalDiscount:number;
    params:URLSearchParams;
    card: Card;
    url:string;

    constructor() {
        this.purchases=[];
        this.purchasesView=[];
        this.purchasesBigView=[];
        this.counterPurchases=0;
        this.counterFavourite=0;
        this.totalPrice=0;
        this.totalDiscountPrice=0;
        this.limitProducts=3;
        this.pages=1;
        this.currentPage=1;
        this.promocodes=[{name: "RS", discount:10}, {name: "Мяу-мяу", discount:20},  {name: "хуй", discount:99}];
        this.totalDiscount=0;
        this.apliedPromocodes=[];
        this.params = new URLSearchParams(location.search);
        this.card=new Card();
        this.url=window.location.origin


    }
    getQueryParams(times:string){
        let queries:string[]=location.search.substr(1).split('&');
        if(queries[0]!==''){
            for(let i=0; i<queries.length; i++){
                let key=queries[i].split('=')[0];
                let value=queries[i].split('=')[1];
                if(key=='limit'){
                    if(times=='first'){
                        this.limitProducts=+value;
                        this.params.set('limit', value);
                        (document.querySelector('#limit-products') as HTMLInputElement).value=value; 
                    }
                };
                if(key=='page'){
                    if(times=='first'){
                        this.currentPage=+value;
                        this.params.set('page', value); 
                        if(+value>1){
                            (document.querySelector('#previousPage') as HTMLButtonElement).disabled=false;
                        }
                        (document.querySelector('#big-cart-selected-page') as HTMLElement).innerHTML=this.currentPage.toString();
                    }
                };
                
            }     
        }     
    }

    writeQueryParams() {
        if(this.params.has('limit')||this.params.has('page')){
            window.history.replaceState({}, '', `${location.pathname}?${this.params}`); 
        } else {
            window.history.replaceState({}, '', `${location.pathname}`)
        }
    }

    renderCartFrame() {
        (document.querySelector('main') as HTMLElement).innerHTML=`
        <section class="two-columns">
        <div class="big-cart">
            <div class="big-cart-parameters">
                <h2 class="big-cart__h2">Парфюм в корзине</h2>
                <div>
                <label class="limit-products" for="limit-products">Лимит на странице</label>
                <input type="text" id="limit-products" value="3">
                </div>
                <div class="big-cart-pages">
                    <span class="big-cart-pages__span">Страница:</span>
                    <button class="big-cart__btn" id="previousPage" disabled><</button>
                    <span id="big-cart-selected-page">1</span>
                    <button class="big-cart__btn" id="nextPage">></button>
                </div>
            </div>
            <div class="big-cart-products"></div>
        </div>
        <div class="promocode">
            <h2 class="promocode__h2">Итого:</h2>
            <h3 class="promocode__h3">Количество в корзине: <span id="total-quantity"></span></h3>
            <h3 id="total-price-discount__span"></h3>
            <h3 class="total-price__h3">Общая стоимость: <span class="cross none"></span><span id="total-price__span"></span>
            </h3>
            <div id="aplied-promocodes" class="none">
                <h4>Применённые промокоды</h4>
                <ul class="aplied-promocodes__ul">
                </ul>
            </div>
            <div class="enter-promocode__div">
            <input type="text" id="enter-promocode" placeholder="Введите промокод">
            <button type="reset" class="reset-promocode none">X</button>
            </div>               
            <p class="examples">Например, "RS" или "Мяу-мяу"</p>
            <button type="submit" id="buy">Купить</button>
        </div>
   </section> `
   this.showModal();
    }

    renderCart(){

        this.purchases=JSON.parse(localStorage.getItem("purchases"));
        this.purchasesBigView=JSON.parse(localStorage.getItem("purchasesBigView"));
        this.purchasesView=JSON.parse(localStorage.getItem("purchasesView"));
        this.counterPurchases=+localStorage.getItem("counterPurchases");
    
        if(this.purchases.length==0) {
            (document.querySelector('main') as HTMLElement).innerHTML='';
            (document.querySelector('main') as HTMLElement).classList.add('nocart');
        return
        }
        let counterPurchases=document.querySelector('.cart__round') as HTMLElement;
        counterPurchases.classList.remove('hidden');
        counterPurchases.innerHTML=this.counterPurchases.toString();
        (document.querySelector('main') as HTMLElement).classList.remove('nocart');
        let bigCart=document.querySelector(".big-cart-products") as HTMLElement;
        if(document.querySelector('#limit-products')){
            this.limitProducts=+(document.querySelector('#limit-products') as HTMLInputElement).value;
        }
        this.pages=Math.ceil(this.purchases.length/this.limitProducts);
        if(this.currentPage==0) this.currentPage=1;
        if(this.pages>1) {
            if(bigCart){
                  bigCart.innerHTML=this.purchasesBigView.slice((this.currentPage*this.limitProducts)-this.limitProducts, (this.currentPage*this.limitProducts)).join('\n');
                [...document.querySelectorAll('.counter')].forEach((elem, index)=> {
                    elem.innerHTML=`${this.currentPage*this.limitProducts-this.limitProducts+1+index}`
                })
            }
        } else if(this.pages==1){
            if(bigCart){
                bigCart.innerHTML=this.purchasesBigView.join('\n');
                [...document.querySelectorAll('.counter')].forEach((elem, index)=> {
                    elem.innerHTML=`${this.currentPage*this.limitProducts-this.limitProducts+1+index}`
                })
        }
        }
        if(this.currentPage==this.pages){
            (document.querySelector('#nextPage') as HTMLButtonElement).disabled=true;
        }
        this.totalPrice=this.purchases.reduce((acc, cur)=> {
            let price=+cur.price.split(' ')[0]
            return acc + price*cur.quantity
        }, 0);
        this.apliedPromocodes=JSON.parse(localStorage.getItem("promocodes"))||[];
        if(this.apliedPromocodes.length>0){
            document.querySelector('.aplied-promocodes__ul').innerHTML='';
            this.totalDiscount=0;
            this.apliedPromocodes.forEach((el)=> {
                this.totalDiscount+=el.discount;
                this.renderPromocodeDiv(el)})
        }   
        this.totalDiscountPrice=Math.round(this.totalPrice*(100-this.totalDiscount)/100);
        
        (document.querySelector('#total-quantity') as HTMLElement).innerHTML=`${this.counterPurchases}`;
        (document.querySelector('#total-price__span') as HTMLElement).innerHTML=`${this.totalPrice} руб.`;
        
        if(this.totalDiscount>0){
            (document.querySelector('#total-price-discount__span') as HTMLElement).innerHTML=`${this.totalDiscountPrice} руб.`;
        };

        document.querySelectorAll('.quantity-plus-big').forEach(elem => {
            elem.addEventListener('click', (e)=> {
                let target=e.target as HTMLElement
                for(let i=0; i<this.purchases.length; i++) {
                    if(target?.parentElement?.id==this.purchases[i].id &&
                        target?.parentElement?.dataset.size==this.purchases[i].size) {
                        this.purchases[i].quantity++;
                        this.counterPurchases++
                        let counterPurchases=document.querySelector('.cart__round') as HTMLElement;
                        counterPurchases.innerHTML=this.counterPurchases.toString();
                        let totalPriceForPerfume:number=(+this.purchases[i].price.split(' ')[0])*this.purchases[i].quantity
                        this.purchasesBigView[i]=` 
                        <li class="big-cart__li" id=${this.purchases[i].id} data-size=${this.purchases[i].size}>
                        <span class="counter">${i+1}</span>
                        <img class=big-cart__img src="/img/${this.purchases[i].id}/${this.purchases[i].id}.jpg" alt="${this.purchases[i].perfume}">
                            <div class="big-cart__name">
                            <span>${this.purchases[i].perfume}</span>
                            <span>${this.purchases[i].size} мл</span>
                            </div>
                            <button class="quantity-minus-big">-</button>
                            <p class="quantity">${this.purchases[i].quantity}</p>
                            <button class="quantity-plus-big" >+</button>
                            <span class="big-cart-price"> = ${totalPriceForPerfume} руб.</span>
                        </li>`

                        this.purchasesView[i]=` 
                        <li class="mini-cart__li" id=${this.purchases[i].id} data-size=${this.purchases[i].size}>
                            <div class="mini-cart__name">
                            <img class=mini-cart__img src="/img/${this.purchases[i].id}/${this.purchases[i].id}.jpg" alt="${this.purchases[i].perfume}">
                            <span>${this.purchases[i].perfume}</span>
                            <span>${this.purchases[i].size} мл</span>
                            </div>
                            <button class="quantity-minus">-</button>
                            <p class="quantity">${this.purchases[i].quantity}</p>
                            <button class="quantity-plus" >+</button>
                            <span> = ${totalPriceForPerfume} руб.</span>
                        </li>`
                        localStorage.setItem("purchases", JSON.stringify(this.purchases));
                        localStorage.setItem("purchasesView", JSON.stringify(this.purchasesView));
                        localStorage.setItem("purchasesBigView", JSON.stringify(this.purchasesBigView));
                        localStorage.setItem("counterPurchases", this.counterPurchases.toString());  
                        this.renderCart()
                    }
                }
                   
            })
        }) ;
        document.querySelectorAll('.quantity-minus-big').forEach(elem => {
            elem.addEventListener('click', (e)=> {
                let target=e.target as HTMLElement
                for(let i=0; i<this.purchases.length; i++) {
                    if(target?.parentElement?.id==this.purchases[i].id &&
                        target?.parentElement?.dataset.size==this.purchases[i].size) {
                        this.purchases[i].quantity--;
                        this.counterPurchases--;
                        let counterPurchases=document.querySelector('.cart__round') as HTMLElement;
                        counterPurchases.innerHTML=this.counterPurchases.toString();
                        if(this.purchases[i].quantity==0) {
                                this.purchases.splice(i, 1);
                                this.purchasesBigView.splice(i, 1);
                                this.purchasesView.splice(i, 1);
                                let pagesNow=Math.ceil(this.purchases.length/this.limitProducts);
                                 if(this.currentPage==pagesNow){
                                    (document.querySelector('#nextPage') as HTMLButtonElement).disabled=true;
                                }
                                if(pagesNow<this.pages && this.currentPage==this.pages){
                                    this.currentPage--;
                                    this.params.set('page', this.currentPage.toString());
                                    (document.querySelector('#big-cart-selected-page') as HTMLElement).innerHTML=this.currentPage.toString();
                                    if(this.currentPage==1){
                                        (document.querySelector('#previousPage') as HTMLButtonElement).disabled=true;
                                    }
                                }
                                if(this.purchases.length==0) {
                                    (document.querySelector('main') as HTMLElement).innerHTML='';
                                    (document.querySelector('main') as HTMLElement).classList.add('nocart');
                                    (document.querySelector('.mini-cart') as HTMLElement).innerHTML=''
                                    counterPurchases.classList.add('hidden');
                                    document.querySelectorAll('.cart__btn').forEach((elem)=> {
                                            elem.classList.remove('cart__btn_active');
                                        }) 
                                        localStorage.setItem("purchases", JSON.stringify(this.purchases));
                                        localStorage.setItem("purchasesView", JSON.stringify(this.purchasesView));
                                        localStorage.setItem("purchasesBigView", JSON.stringify(this.purchasesBigView));
                                        localStorage.setItem("counterPurchases", this.counterPurchases.toString());                                   
                                    return
                                } else {
                                    document.querySelectorAll('.card').forEach((elem)=> {
                                        if(elem.id==target?.parentElement?.id) {
                                            elem.querySelector('.cart__btn')?.classList.remove('cart__btn_active')
                                        }
                                    })
                                    localStorage.setItem("purchases", JSON.stringify(this.purchases));
                                    localStorage.setItem("purchasesView", JSON.stringify(this.purchasesView));
                                    localStorage.setItem("purchasesBigView", JSON.stringify(this.purchasesBigView));
                                    localStorage.setItem("counterPurchases", this.counterPurchases.toString());
                                   this.renderCart();
                                   break
    
                                }

                            
                        }
                        let totalPriceForPerfume:number=(+this.purchases[i].price.split(' ')[0])*this.purchases[i].quantity
                        this.purchasesBigView[i]=` 
                        <li class="big-cart__li" id=${this.purchases[i].id} data-size=${this.purchases[i].size}>
                        <span class="counter">${i+1}</span>
                        <img class=big-cart__img src="/img/${this.purchases[i].id}/${this.purchases[i].id}.jpg" alt="${this.purchases[i].perfume}">
                            <div class="big-cart__name">
                            <span>${this.purchases[i].perfume}</span>
                            <span>${this.purchases[i].size} мл</span>
                            </div>
                            <button class="quantity-minus-big">-</button>
                            <p class="quantity">${this.purchases[i].quantity}</p>
                            <button class="quantity-plus-big" >+</button>
                            <span class="big-cart-price"> = ${totalPriceForPerfume} руб.</span>
                        </li>`
                        
                        this.purchasesView[i]=` 
                        <li class="mini-cart__li" id=${this.purchases[i].id} data-size=${this.purchases[i].size}>
                            <div class="mini-cart__name">
                            <img class=mini-cart__img src="/img/${this.purchases[i].id}/${this.purchases[i].id}.jpg" alt="${this.purchases[i].perfume}">
                            <span>${this.purchases[i].perfume}</span>
                            <span>${this.purchases[i].size} мл</span>
                            </div>
                            <button class="quantity-minus">-</button>
                            <p class="quantity">${this.purchases[i].quantity}</p>
                            <button class="quantity-plus" >+</button>
                            <span> = ${totalPriceForPerfume} руб.</span>
                        </li>`
                        localStorage.setItem("purchases", JSON.stringify(this.purchases));
                         localStorage.setItem("purchasesView", JSON.stringify(this.purchasesView));
                        localStorage.setItem("purchasesBigView", JSON.stringify(this.purchasesBigView));
                        localStorage.setItem("counterPurchases", this.counterPurchases.toString()); 
                        this.renderCart();
                        
                    }
                }
                     
            })
        }) ;
        document.querySelectorAll('.big-cart__name')?.forEach((el)=> el.addEventListener('click', ()=>{
            this.goToCard(el)
        }))
        document.querySelectorAll('.big-cart__img')?.forEach((el)=> el.addEventListener('click', ()=>{
            this.goToCard(el)
        }))
        
               
    
    }
    goToCard(el){
        let id=el.parentElement.id;
        window.history.replaceState({}, '', `${this.url}/product-details/${id}`)
        this.card.render(id);
        this.card.addCardEvents();
        this.renderMiniCart();
        for(let i=0; i<this.purchases.length; i++){
            const id=document.querySelector('.card-details').id;
            const size=document.querySelector('.card-details-size_active')?.firstElementChild.innerHTML.split(' ')[0];
            if(this.purchases[i].id==id && size==this.purchases[i].size){
                (document.querySelector('#put-in-cart') as HTMLElement).innerHTML='В корзине';
            }
        }
        document.querySelectorAll('.card-details-size')?.forEach((elem)=>{
            elem.addEventListener('click', ()=>{
                document.querySelectorAll('.card-details-size').forEach(el => {
                el.classList.remove('card-details-size_active')});
                elem.classList.add('card-details-size_active');
                for(let i=0; i<this.purchases.length; i++){
                    const id=document.querySelector('.card-details').id;
                    const size=document.querySelector('.card-details-size_active')?.firstElementChild.innerHTML.split(' ')[0];
                    if(this.purchases[i].id==id && size==this.purchases[i].size){
                        (document.querySelector('#put-in-cart') as HTMLElement).innerHTML='В корзине';
                        break;
                    }
                    if(i==this.purchases.length-1 && this.purchases[i].size!=size){
                        (document.querySelector('#put-in-cart') as HTMLElement).innerHTML='В корзину';
                    }
                }
            })
        })
        document.querySelector('#put-in-cart').addEventListener('click', ()=>{
        let size=document.querySelector('.card-details-size_active').firstElementChild.innerHTML.split(' ')[0];
        let price=document.querySelector('.card-details-size_active').lastElementChild.innerHTML.split(' ')[0]+" руб.";
        let perfume=document.querySelector('.card-details__h2').innerHTML
        this.putInCart(id, perfume, size, price, 1);
        })
        document.querySelector('#buy-now')?.addEventListener('click', ()=>{
            let size=document.querySelector('.card-details-size_active').firstElementChild.innerHTML.split(' ')[0];
            let price=document.querySelector('.card-details-size_active').lastElementChild.innerHTML.split(' ')[0]+" руб.";
            let perfume=document.querySelector('.card-details__h2').innerHTML;
            (document.querySelector('#put-in-cart') as HTMLElement).innerHTML='В корзине';
            this.purchases.forEach((el)=> {
                if(el.id!==id && el.size!==size) {this.putInCart(id, perfume, size, price, 1)}
            })
            window.history.replaceState({}, '', `${this.url}/cart`);
            this.renderCartFrame();
            this.renderCart();
            this.addBigCartEvents();
            (document.querySelector('.mini-cart') as HTMLElement).innerHTML='';
            (document.querySelector('.modal') as HTMLElement).classList.remove('none');
            (document.querySelector('.darken') as HTMLElement).classList.remove('none');         
        });
    }
    addBigCartEvents(){

        document.querySelector('#limit-products')?.addEventListener('change', (e)=>{
            this.limitProducts=+(document.querySelector('#limit-products') as HTMLInputElement).value;
            this.params.set('limit', this.limitProducts.toString()); 
            this.writeQueryParams()
            let pagesNow=Math.ceil(this.purchases.length/this.limitProducts);
            if(this.currentPage==pagesNow){
               (document.querySelector('#nextPage') as HTMLButtonElement).disabled=true;
           };
           if(pagesNow>this.pages) {
            (document.querySelector('#nextPage') as HTMLButtonElement).disabled=false;
           }
           if(pagesNow<this.pages && this.currentPage==this.pages){
               this.currentPage--;
               this.params.set('page', this.currentPage.toString());
               (document.querySelector('#big-cart-selected-page') as HTMLElement).innerHTML=this.currentPage.toString();
               if(this.currentPage==1){
                   (document.querySelector('#previousPage') as HTMLButtonElement).disabled=true;
               }
           }
            this.renderCart();

        });
        document.querySelector('#nextPage')?.addEventListener('click', (e)=>{
            this.currentPage++;
            this.params.set('page', this.currentPage.toString());
            this.writeQueryParams()
            if(document.querySelector('#big-cart-selected-page')){
                (document.querySelector('#big-cart-selected-page') as HTMLElement).innerHTML=this.currentPage.toString();
            }
            (document.querySelector('#previousPage') as HTMLButtonElement).disabled=false;
            if(this.currentPage==this.pages){
                (document.querySelector('#nextPage') as HTMLButtonElement).disabled=true;
            }
            this.renderCart();   
        });
        document.querySelector('#previousPage')?.addEventListener('click', (e)=>{
            this.currentPage--;
            this.params.set('page', this.currentPage.toString()); 
            this.writeQueryParams();
            if(document.querySelector('#big-cart-selected-page')){
                (document.querySelector('#big-cart-selected-page') as HTMLElement).innerHTML=this.currentPage.toString();
            }
            (document.querySelector('#nextPage') as HTMLButtonElement).disabled=false;
            if(this.currentPage==1){
                (document.querySelector('#previousPage') as HTMLButtonElement).disabled=true;
            }
            this.renderCart();   
        });
        document.querySelector('#enter-promocode')?.addEventListener('input', ()=> {
            (document.querySelector('.reset-promocode') as HTMLElement).classList.remove('none'); 
            if((document.querySelector('#enter-promocode') as HTMLInputElement).value==''){
                document.querySelector('.promocode-before-applying')?.remove();
            }          
            this.promocodes.forEach((el)=> {
                if((document.querySelector('#enter-promocode') as HTMLInputElement).value==el.name) {
                    for(let i=0; i<this.apliedPromocodes.length; i++) {
                        if((document.querySelector('#enter-promocode') as HTMLInputElement).value==this.apliedPromocodes[i].name){
                            return
                        }
                    }
                   let div=document.createElement('div');
                   div.classList.add('promocode-before-applying');
                   div.innerHTML= `${el.name} - ${el.discount} % <button type="submit" class="apply-promocode__btn">Применить</button>`;
                   (document.querySelector('.enter-promocode__div') as Node).appendChild(div);
                   document.querySelector('.apply-promocode__btn').addEventListener('click', ()=> {
                    this.apliedPromocodes.push(el);
                    localStorage.setItem("promocodes", JSON.stringify(this.apliedPromocodes));
                    this.totalDiscount+=el.discount;
                    this.renderPromocodeDiv(el)});       
               }
           })
            

        });
        document.querySelector('.reset-promocode')?.addEventListener('click', ()=> {
            (document.querySelector('#enter-promocode') as HTMLInputElement).value='';
            document.querySelector('.promocode-before-applying')?.remove();
        });
        document.querySelector('#buy')?.addEventListener('click', ()=> {
            (document.querySelector('.modal') as HTMLElement).classList.remove('none');
            (document.querySelector('.darken') as HTMLElement).classList.remove('none')  
        });

    }
    renderMiniCart() {
        this.purchases=JSON.parse(localStorage.getItem("purchases"));
        this.purchasesView=JSON.parse(localStorage.getItem("purchasesView"));
        this.counterPurchases=+localStorage.getItem("counterPurchases");
        let counterPurchases=document.querySelector('.cart__round') as HTMLElement;
        
        this.totalPrice=this.purchases.reduce((acc, cur)=> {
            let price=+cur.price.split(' ')[0]
            return acc + price*cur.quantity
        }, 0)
       let miniCart=document.querySelector(".mini-cart") as HTMLElement
        if(miniCart && this.purchases.length>0){
        miniCart.innerHTML=this.purchasesView.join('\n')+`
        <p class="mini-cart__total">Общая стоимость: ${this.totalPrice} руб.</p>
        <button class="go-to-cart__btn">Перейти в корзину</button>`; 

        counterPurchases.classList.remove('hidden');
        counterPurchases.innerHTML=this.counterPurchases.toString();

        document.querySelectorAll('.quantity-plus').forEach(elem => {
            elem.addEventListener('click', (e)=> {
                let target=e.target as HTMLElement
                for(let i=0; i<this.purchases.length; i++) {
                    if(target?.parentElement?.id==this.purchases[i].id &&
                        target?.parentElement?.dataset.size==this.purchases[i].size) {
                        this.purchases[i].quantity++;
                        this.counterPurchases++
                        let counterPurchases=document.querySelector('.cart__round') as HTMLElement;
                        counterPurchases.innerHTML=this.counterPurchases.toString();
                        let totalPriceForPerfume:number=(+this.purchases[i].price.split(' ')[0])*this.purchases[i].quantity
                        this.purchasesView[i]=` 
                        <li class="mini-cart__li" id=${this.purchases[i].id} data-size=${this.purchases[i].size}>
                            <div class="mini-cart__name">
                            <img class=mini-cart__img src="/img/${this.purchases[i].id}/${this.purchases[i].id}.jpg" alt="${this.purchases[i].perfume}">
                            <span>${this.purchases[i].perfume}</span>
                            <span>${this.purchases[i].size} мл</span>
                            </div>
                            <button class="quantity-minus">-</button>
                            <p class="quantity">${this.purchases[i].quantity}</p>
                            <button class="quantity-plus" >+</button>
                            <span> = ${totalPriceForPerfume} руб.</span>
                        </li>`
                        
                        this.purchasesBigView[i]=` 
                        <li class="big-cart__li" id=${this.purchases[i].id} data-size=${this.purchases[i].size}>
                        <span class="counter">${i+1}</span>
                        <img class=big-cart__img src="/img/${this.purchases[i].id}/${this.purchases[i].id}.jpg" alt="${this.purchases[i].perfume}">
                            <div class="big-cart__name">
                            <span>${this.purchases[i].perfume}</span>
                            <span>${this.purchases[i].size} мл</span>
                            </div>
                            <button class="quantity-minus-big">-</button>
                            <p class="quantity">${this.purchases[i].quantity}</p>
                            <button class="quantity-plus-big" >+</button>
                            <span class="big-cart-price"> = ${totalPriceForPerfume} руб.</span>
                        </li>`
                        localStorage.setItem("purchases", JSON.stringify(this.purchases));
                        localStorage.setItem("purchasesView", JSON.stringify(this.purchasesView));
                        localStorage.setItem("purchasesBigView", JSON.stringify(this.purchasesBigView));
                        localStorage.setItem("counterPurchases", this.counterPurchases.toString());  
                        this.renderMiniCart();
                    }
                }
                  
            })
        }) ;
        document.querySelectorAll('.quantity-minus').forEach(elem => {
            elem.addEventListener('click', (e)=> {
                let target=e.target as HTMLElement
                for(let i=0; i<this.purchases.length; i++) {
                    if(target?.parentElement?.id==this.purchases[i].id &&
                        target?.parentElement?.dataset.size==this.purchases[i].size) {
                        this.purchases[i].quantity--;
                        this.counterPurchases--;
                        let counterPurchases=document.querySelector('.cart__round') as HTMLElement;
                        counterPurchases.innerHTML=this.counterPurchases.toString();
                        if(this.purchases[i].quantity==0) {
                                const id=document.querySelector('.card-details')?.id;
                                const size=document.querySelector('.card-details-size_active')?.firstElementChild.innerHTML.split(' ')[0];
                                if(this.purchases[i].id==id && size==this.purchases[i].size){
                                    (document.querySelector('#put-in-cart') as HTMLElement).innerHTML='В корзину';
                                }
                                this.purchases.splice(i, 1);
                                this.purchasesView.splice(i, 1);
                                this.purchasesBigView.splice(i, 1);
                                

                                localStorage.setItem("purchases", JSON.stringify(this.purchases));
                                localStorage.setItem("purchasesView", JSON.stringify(this.purchasesView));
                                localStorage.setItem("purchasesBigView", JSON.stringify(this.purchasesBigView));
                                localStorage.setItem("counterPurchases", this.counterPurchases.toString());
                                
                                if(this.purchases.length==0) {
                                    miniCart.innerHTML='';
                                    counterPurchases.classList.add('hidden');
                                    if(document.querySelector('.two-columns')){
                                        (document.querySelector('.two-columns') as HTMLElement).innerHTML='';
                                    }
                                    
                                    
                                    counterPurchases.classList.add('hidden');
                                    document.querySelectorAll('.cart__btn').forEach((elem)=> {
                                            elem.classList.remove('cart__btn_active');
                                        });
                                        localStorage.setItem("purchases", JSON.stringify(this.purchases));
                                        localStorage.setItem("purchasesView", JSON.stringify(this.purchasesView));
                                        localStorage.setItem("purchasesBigView", JSON.stringify(this.purchasesBigView));
                                        localStorage.setItem("counterPurchases", this.counterPurchases.toString());                                    
                                    return
                                } else {
                                    document.querySelectorAll('.card').forEach((elem)=> {
                                        if(elem.id==target?.parentElement?.id) {
                                            elem.querySelector('.cart__btn')?.classList.remove('cart__btn_active')
                                        }
                                    })
                                   this.renderMiniCart();    
                                }

                            
                        }
                        let totalPriceForPerfume:number=(+this.purchases[i].price.split(' ')[0])*this.purchases[i].quantity
                        this.purchasesView[i]=` 
                        <li class="mini-cart__li" id=${this.purchases[i].id} data-size=${this.purchases[i].size}>
                            <div class="mini-cart__name">
                            <img class=mini-cart__img src="/img/${this.purchases[i].id}/${this.purchases[i].id}.jpg" alt="${this.purchases[i].perfume}">
                            <span>${this.purchases[i].perfume}</span>
                            <span>${this.purchases[i].size} мл</span>
                            </div>
                            <button class="quantity-minus">-</button>
                            <p class="quantity">${this.purchases[i].quantity}</p>
                            <button class="quantity-plus" >+</button>
                            <span> = ${totalPriceForPerfume} руб.</span>
                        </li>`
                        

                        this.purchasesBigView[i]=`
                        <li class="big-cart__li" id=${this.purchases[i].id} data-size=${this.purchases[i].size}>
                        <span class="counter">${i+1}</span>
                        <img class=big-cart__img src="/img/${this.purchases[i].id}/${this.purchases[i].id}.jpg" alt="${this.purchases[i].perfume}">
                        <div class="big-cart__name">
                        <span>${this.purchases[i].perfume}</span>
                        <span>${this.purchases[i].size} мл</span>
                        </div>
                        <button class="quantity-minus-big">-</button>
                        <p class="quantity">${this.purchases[i].quantity}</p>
                        <button class="quantity-plus-big">+</button>
                        <span class="big-cart-price"> = ${totalPriceForPerfume} руб.</span>
                    </li>`
                        localStorage.setItem("purchases", JSON.stringify(this.purchases));
                         localStorage.setItem("purchasesView", JSON.stringify(this.purchasesView));
                        localStorage.setItem("purchasesBigView", JSON.stringify(this.purchasesBigView));
                        localStorage.setItem("counterPurchases", this.counterPurchases.toString());
                        this.renderMiniCart();
                                      
                    }
                }
   
            })
        }) ;

    }
    
    document.querySelector('.go-to-cart__btn')?.addEventListener('click', ()=> {
        window.history.replaceState({}, '', `${this.url}/cart`);
            this.renderCartFrame();
           this.renderCart();
        });
    }   
    putInCart(id:string, perfume:string, size:string, price:string, quantity:number) {
        this.counterPurchases++;
        let counterPurchases=document.querySelector('.cart__round') as HTMLElement;
        counterPurchases.classList.remove('hidden');
        counterPurchases.innerHTML=this.counterPurchases.toString();
        perfume=perfume.split('<br>').join(' ')
        for(let i=0; i<this.purchases.length; i++) {
            if(id==this.purchases[i].id && size==this.purchases[i].size) {
                this.purchases[i].quantity++;
                let totalPriceForPerfume:number=(+price.split(' ')[0])*this.purchases[i].quantity;

                this.purchasesView[i]=` 
                <li class="mini-cart__li" id=${id} data-size="${size}">
                    <div class="mini-cart__name">
                    <img class=mini-cart__img src="/img/${id}/${id}.jpg" alt="${perfume}">
                    <span>${perfume}</span>
                    <span>${size} мл</span>
                    </div>
                    <button class="quantity-minus">-</button>
                    <p class="quantity">${this.purchases[i].quantity}</p>
                    <button class="quantity-plus" >+</button>
                    <span> = ${totalPriceForPerfume} руб.</span>
                </li>`

                this.purchasesBigView[i]=` 
                <li class="big-cart__li" id=${id} data-size="${size}">
                     <span class="counter">${i}</span>
                    <img class=big-cart__img src="/img/${id}/${id}.jpg" alt="${perfume}">
                    <div class="big-cart__name">
                    <span>${perfume}</span>
                    <span>${size} мл</span>
                    </div>
                    <button class="quantity-minus-big">-</button>
                    <p class="quantity">${this.purchases[i].quantity}</p>
                    <button class="quantity-plus-big" >+</button>
                    <span class="big-cart-price"> = ${totalPriceForPerfume} руб.</span>
                </li>`
                localStorage.setItem("purchases", JSON.stringify(this.purchases));
                localStorage.setItem("purchasesView", JSON.stringify(this.purchasesView));
                localStorage.setItem("purchasesBigView", JSON.stringify(this.purchasesBigView));
                localStorage.setItem("counterPurchases", this.counterPurchases.toString());
                this.renderMiniCart()
                return 
            }
        }

                this.purchases.push({"id":id, "perfume":perfume, "size":size, "price":price, "quantity":quantity});
                this.purchasesView.push(` 
            <li class="mini-cart__li" id=${id} data-size="${size}">
                <div class="mini-cart__name">
                <img class=mini-cart__img src="/img/${id}/${id}.jpg" alt="${perfume}">
                <span>${perfume}</span>
                <span>${size} мл</span>
                </div>
                <button class="quantity-minus">-</button>
                <span class="quantity">${quantity}</span>
                <button class="quantity-plus" >+</button>
                <span> = ${price}</span>
            </li>`);

            this.purchasesBigView.push(` 
            <li class="big-cart__li" id=${id} data-size="${size}">
                <span class="counter">${this.purchases.length}</span>
                <img class=big-cart__img src="/img/${id}/${id}.jpg" alt="${perfume}">
                <div class="big-cart__name">
                <span>${perfume}</span>
                <span>${size} мл</span>
                </div>
                <button class="quantity-minus-big">-</button>
                <span class="quantity">${quantity}</span>
                <button class="quantity-plus-big" >+</button>
                <span class="big-cart-price"> = ${price}</span>
            </li>`);
        localStorage.setItem("purchases", JSON.stringify(this.purchases));
        localStorage.setItem("purchasesView", JSON.stringify(this.purchasesView));
        localStorage.setItem("purchasesBigView", JSON.stringify(this.purchasesBigView));
        localStorage.setItem("counterPurchases", this.counterPurchases.toString());

        this.renderMiniCart();
    }
    renderPromocodeDiv(el){
        let div=document.createElement('div');
        div.classList.add('aplied-promocode__div');
        div.id=el.name;
        div.innerHTML= `<p>${el.name} - ${el.discount} % </p><button type="reset" class="reset-promocode reset-promocode__btn">X</button>`;
        document.querySelector('#aplied-promocodes').classList.remove('none');
        document.querySelector('.aplied-promocodes__ul').appendChild(div);
        (document.querySelector('#enter-promocode') as HTMLInputElement).value='';
        document.querySelector('.promocode-before-applying')?.remove();
        this.totalDiscountPrice=Math.round(this.totalPrice*(100-this.totalDiscount)/100);
        document.querySelector('.cross').classList.remove('none')
        document.querySelector('#total-price-discount__span').innerHTML=`${this.totalDiscountPrice} руб.`
        document.querySelectorAll('.reset-promocode__btn').forEach((btn)=> {
         btn.addEventListener('click', ()=>{
             this.apliedPromocodes.forEach((el, index)=> {
                 if(el.name==btn.parentElement.id){
                     this.apliedPromocodes.splice(index, 1);
                     this.totalDiscount-=el.discount;
                     localStorage.setItem("promocodes", JSON.stringify(this.apliedPromocodes));
                     if(this.totalDiscount==0){
                         btn.parentElement.remove();
                         document.querySelector('#aplied-promocodes').classList.add('none');
                         this.totalDiscountPrice=Math.round(this.totalPrice*(100-this.totalDiscount)/100);
                         document.querySelector('#total-price-discount__span').innerHTML='';
                         document.querySelector('.cross').classList.add('none');
                     } else {
                         btn.parentElement.remove();
                         this.totalDiscountPrice=Math.round(this.totalPrice*(100-this.totalDiscount)/100);
                         document.querySelector('#total-price-discount__span').innerHTML=`${this.totalDiscountPrice} руб.`;
                     }
                     

                 }
             })
         })
     })
    }
    putInFavourite() {
        this.counterFavourite++;
        let counterFavourite=document.querySelector('.favourite__round') as HTMLElement;
        counterFavourite.classList.remove('hidden');
        counterFavourite.innerHTML=this.counterFavourite.toString();


    }
    takeFromFavourite() {
        this.counterFavourite--;
        let counterFavourite=document.querySelector('.favourite__round') as HTMLElement;
        if(this.counterFavourite==0) {
            counterFavourite.classList.add('hidden');
        }
        counterFavourite.innerHTML=this.counterFavourite.toString();
}

    showItemsInCart() {
    this.purchases=JSON.parse(localStorage.getItem("purchases"));
    let purchases=this.purchases;
    let cards=document.querySelectorAll('.card');
    for(let i=0; i<cards.length; i++) {
     for(let j=0; j<purchases.length; j++) {
         if(cards[i].id==purchases[j].id) {
             let cartButton=cards[i].querySelector(".cart__btn");
             cartButton?.classList.add('cart__btn_active');
             let sizes=cards[i].querySelectorAll(".select-size");
             let prices=cards[i].querySelectorAll(".price");
             sizes.forEach((el)=> {el.classList.remove('select-size_active');
                 if(el.innerHTML==purchases[j].size) {
                     el.classList.add('select-size_active');
                 }

             });
             
             prices.forEach((el)=> {el.classList.add('none');
             el.classList.remove('select-price_active');
             if(el.innerHTML==purchases[j].price) {
                 el.classList.remove('none')
                 el.classList.add('select-price_active');
             }
             });

         }
     }
    }

    } 

    showItemsFavourite (favourites){
    let counterFavourite=document.querySelector('.favourite__round') as HTMLElement;
    let cards=document.querySelectorAll('.card');
    for(let i=0; i<cards.length; i++) {
     for(let j=0; j<favourites.length; j++) {
         if(cards[i].id==favourites[j].id) {
             let faveButton=cards[i].querySelector(".favourite__btn");
             faveButton?.classList.add('favourite__btn_active');
             counterFavourite.classList.remove('hidden');
             counterFavourite.innerHTML=favourites.length;
             
             };
             
         }
     }
    }
   
    showModal(){
        if(document.querySelector('.modal')) return
        let section=document.createElement('form');
        section.classList.add('modal');
        section.classList.add('none');
        section.innerHTML=`
            <h2>Детали заказа</h2>
            <div class="order-details">
            <div>
            <label class="order__label" for="name-surname">Фамилия и имя</label>
            <input class="order__input" type="text" name="name-surname" id="name-surname" placeholder="Введите фамилию и имя" required>
            <p id="err-name" class="order__err">Неверный формат. Введите данные в формате "Фамилия Имя"</p>
            </div>
            <div>
            <label class="order__label" for="phone">Номер телефона </label>
            <input class="order__input" type="text" name="phone" id="phone" placeholder="Введите телефон" required>
            <p id="err-phone" class="order__err">Неверный формат. Введите телефон в формате "+ХХХХХХХХХ"</p>
            </div>
            <div>
            <label class="order__label" for="address">Адрес доставки</label>
            <input class="order__input" type="text" name="address" id="address" placeholder="Введите адрес" required>
            <p id="err-address" class="order__err">Неверный формат. Адрес должен содержать не менее 3 слов</p>
            </div>
            <div>
            <label class="order__label" for="email">E-mail</label>
            <input class="order__input" type="email" name="email" id="email" placeholder="Введите e-mail" required>
            <p id="err-email"class="order__err">Неверный формат. Е-mail должен содержать символ @</p>
            </div>
            </div>
            <h2>Данные кредитной карты</h2>
            <div class="credit-card">
                <div class="credit-card-number__div">
                <img id="pay-system" src="" class="hidden" alt="pay-system">
                <input class="order__input" type="text" name="credit-card-number" id="credit-card-number" placeholder="Введите номер карты" required>
                <p id="err-credit-card-number" class="order__err credit-card-number">Неверный формат. Введите 16 цифр номера карты</p>
                </div>
                <div class="credit-card-other__div">
                    <div>
                    <label class="order__label" for="valid-date">Срок действия:</label>
                    <input class="order__input" type="text" name="valid-date" id="valid-date" placeholder="Дата" required>
                    <p id="err-validdate" class="order__err">Неверный формат. Введите срок в формате MM/YY</p>
                    </div>
                   <div>
                   <label class="order__label" for="cvv">СVV:</label>
                   <input class="order__input" type="number" max="999" name="cvv" id="cvv" placeholder="CVV" required>
                   <p id="err-cvv" class="order__err err-svv">Неверный формат. Введите 3 цифры</p>
                   </div>
                </div>
                </div>
            <button type="submit" id="confirm">Подтвердить заказ</button>
            `;
            let overlay=document.createElement('div');
            overlay.classList.add('darken');
            overlay.classList.add('none');
            document.querySelector('body').appendChild(section);
            document.querySelector('body').appendChild(overlay);
            document.querySelector('body').style.overflow='hidden';
            this.validate();
            overlay.addEventListener('click', ()=>{
                overlay.classList.add('none');
                section.classList.add('none');
                document.querySelector('body').style.overflow='auto';
            })
    }
    
    validate(){
        document.querySelectorAll('.order__input').forEach(el => {
            (el as HTMLInputElement).addEventListener('input', (e)=>{
                let err=(e.target as HTMLElement).parentElement.lastElementChild;
                (err as HTMLElement).classList.remove('visible');
                (e.target as HTMLElement).classList.remove('err__input')
            })
        });
        document.querySelector('#name-surname').addEventListener('change', ()=> {
            let value=(document.querySelector('#name-surname') as HTMLInputElement).value;
            if(value!=''){
                if(value.split(' ').length<2 || value.split(' ')[0].length<3 || value.split(' ')[1].length<3 ){
                    document.querySelector('#err-name').classList.add('visible');
                    (document.querySelector('#name-surname') as HTMLInputElement).classList.add('err__input')
                }
            }
           
        })
        document.querySelector('#phone').addEventListener('change', ()=> {
            let value=(document.querySelector('#phone') as HTMLInputElement).value;
            if(value!=''){
                if(value[0] != '+' || value.length < 10 || !(+value.substr(1)>0)) {
                    document.querySelector('#err-phone').classList.add('visible');
                    (document.querySelector('#phone') as HTMLInputElement).classList.add('err__input')
                }
            }
        });
        document.querySelector('#address').addEventListener('change', ()=> {
            let value=(document.querySelector('#address') as HTMLInputElement).value;
            if(value!=''){
                if(value.split(' ').length<3) {
                    document.querySelector('#err-address').classList.add('visible');
                    (document.querySelector('#address') as HTMLInputElement).classList.add('err__input')
                }
            }
        })
        document.querySelector('#email').addEventListener('change', ()=> {
            let value=(document.querySelector('#email') as HTMLInputElement).value;
            if(value!=''){
                const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                if(reg.test(value) ==false) {
                    document.querySelector('#err-email').classList.add('visible');
                    (document.querySelector('#email') as HTMLInputElement).classList.add('err__input')
                }
            }
        })
        document.querySelector('#credit-card-number').addEventListener('input', ()=> {
            let value=(document.querySelector('#credit-card-number') as HTMLInputElement).value;
            if(value!=''){
                if(!(+value[value.length-1]>0)) {
                    (document.querySelector('#credit-card-number') as HTMLInputElement).value=value.slice(0,value.length-1)
                } else {
                    if(value[0]=='2'){
                        (document.querySelector('#pay-system') as HTMLImageElement).classList.remove('hidden');
                        (document.querySelector('#pay-system') as HTMLImageElement).src='/img/mir.jpg'
                    }
                    if(value[0]=='4'){
                        (document.querySelector('#pay-system') as HTMLImageElement).classList.remove('hidden');
                        (document.querySelector('#pay-system') as HTMLImageElement).src='/img/visa.png'
                    }
                    if(value[0]=='5'){
                        (document.querySelector('#pay-system') as HTMLImageElement).classList.remove('hidden');
                        (document.querySelector('#pay-system') as HTMLImageElement).src='/img/mastercard.png'
                    }
                    if(value[0]!=='4' && value[0]!=='5' && value[0]!=='2'){
                        (document.querySelector('#pay-system') as HTMLImageElement).classList.add('hidden');
                    }
                    if(value.length==4 || value.length==9 || value.length==14) {
                        (document.querySelector('#credit-card-number') as HTMLInputElement).value=value+' '
                    }
                    if(value.length==20) {
                        (document.querySelector('#credit-card-number') as HTMLInputElement).value=value.slice(0,value.length-1)
                    }
                }

            }
        });
        document.querySelector('#credit-card-number').addEventListener('change', ()=> {
            let value=(document.querySelector('#credit-card-number') as HTMLInputElement).value;
            if(value!=''){
                let valueArr=value.split(' ');
                console.log(valueArr)
                if(value.length!=19 || !(+valueArr[0]>0) || !(+valueArr[1]>0) ||
                !(+valueArr[2]>0) || !(+valueArr[3]>0)) {
                    document.querySelector('#err-credit-card-number').classList.add('visible');
                    (document.querySelector('#credit-card-number') as HTMLInputElement).classList.add('err__input')
                }
            }

        })
        document.querySelector('#valid-date').addEventListener('input', ()=> {
            let value=(document.querySelector('#valid-date') as HTMLInputElement).value;
            if(value!=''){
                let month=['01','02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
                    if(!(+value[value.length-1]>=0)) {
                        (document.querySelector('#valid-date') as HTMLInputElement).value=value.slice(0,value.length-1)
                    } else {
                        if(value.length==2 && !month.includes(value)){
                            document.querySelector('#err-validdate').classList.add('visible');
                            (document.querySelector('#valid-date') as HTMLInputElement).classList.add('err__input')
                        } else if (value.length==2 && month.includes(value)){
                            (document.querySelector('#valid-date') as HTMLInputElement).value=value+'/';
                        }
                        if(value.length==5 && !(+value.substr(3,2)>=23)){
                            document.querySelector('#err-validdate').classList.add('visible');
                            (document.querySelector('#valid-date') as HTMLInputElement).classList.add('err__input')
                        } 
                        if(value.length==6) {
                            (document.querySelector('#valid-date') as HTMLInputElement).value=value.slice(0,value.length-1)
                        }
                    }
                }
        });
        document.querySelector('#valid-date').addEventListener('change', ()=> {
            let value=(document.querySelector('#valid-date') as HTMLInputElement).value;
            if(value!=''){
                let month=['01','02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
                if(value.length!=5 || !month.includes(value.substr(0,2)) || !(+value.substr(3,2)>=23)) {
                    document.querySelector('#err-validdate').classList.add('visible');
                    (document.querySelector('#valid-date') as HTMLInputElement).classList.add('err__input')
                }
            }

        })
        document.querySelector('#cvv').addEventListener('input', ()=> {
            let value=(document.querySelector('#cvv') as HTMLInputElement).value;
            if(value.length==4) {
                (document.querySelector('#cvv') as HTMLInputElement).value=value.slice(0,value.length-1)
            }
        });
        document.querySelector('#cvv').addEventListener('change', ()=> {
            let value=(document.querySelector('#cvv') as HTMLInputElement).value;
            if(value!=''){
                if(value.length!=3) {
                    document.querySelector('#err-cvv').classList.add('visible');
                    (document.querySelector('#cvv') as HTMLInputElement).classList.add('err__input')
                }
            }

        })   
       
    }
    removeAllFromCart (){
        this.purchases=[];
        this.purchasesView=[];
        this.purchasesBigView=[];
        this.counterPurchases=0;
        this.counterFavourite=0;
        this.totalPrice=0;
        this.totalDiscountPrice=0;
        this.limitProducts=3;
        this.pages=1;
        this.currentPage=1;
        this.totalDiscount=0;
        this.apliedPromocodes=[];
        localStorage.setItem("purchases", JSON.stringify(this.purchases));
        localStorage.setItem("purchasesView", JSON.stringify(this.purchasesView));
        localStorage.setItem("purchasesBigView", JSON.stringify(this.purchasesBigView));
        localStorage.setItem("counterPurchases", this.counterPurchases.toString());
        localStorage.setItem("promocodes", JSON.stringify(this.apliedPromocodes));
    }
}
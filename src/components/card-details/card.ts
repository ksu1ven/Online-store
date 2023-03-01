import './card.css';
import * as products from '../../data/data.json' assert {type: 'json'};
interface IProduct { id: number; title: string; brand: string; description: string; family: string; size: number[]; price: number[]; discountPercentage: number; sex: 'мужской'|'женский'|'унисекс'; thumbnail: string; }

const productsStr=JSON.stringify(products);
const productsObj=JSON.parse(productsStr);

export class Card {
    products: IProduct[] = [];

    constructor(){
    this.products=productsObj.default;    
    }

    render(id){
        this.products.forEach((product)=> {
            if(id==product.id){
                document.querySelector('main').innerHTML=`
                <section class="card-details" id="${id}">
                <div class="two-columns2">
                    <div class="card-details-images__div">
                            <div class="card-details-mini-images__div scroll">
                                <img class="card-details__mini-img" src="../../img/${product.id}/${product.id}.jpg" alt="">
                                <img class="card-details__mini-img" src="../../img/404-nothing-found.jpg" alt="">
                                <img class="card-details__mini-img" src="../../img/404-nothing-found-cart.jpg" alt="">
                            </div>
                                <img src="../../img/${product.id}/${product.id}.jpg" alt="" class="card-details__img">
                    </div>
                    <div class="card-details-properties">
                        <h2 class="card-details__h2">${product.brand}<br>${product.title}</h2>
                        <div class="card-details-sizes__div">
        
                        </div>
                        <div class="two-columns2 card-details-properties__buttons">
                            <button type="submit" id="put-in-cart">В корзину</button>
                            <button type="submit" id="buy-now">Купить сейчас</button>
                        </div>
                        <div class="card-details-properties-description">
                        <h3 class="card-details-properties__h3">Для кого: <span class="card-details-properties__span">${product.sex}</span></h3>
                        <h3 class="card-details-properties__h3">Cемейство аромата: <span class="card-details-properties__span">${product.family}</span></h3>
                        <h3 class="card-details-properties__h3">Описание: <span class="card-details-properties__span">${product.description}</span></h3>
                        </div>
                    </div>
                </div>
           </section>
                `;
    
            for(let i=0; i<product.size.length;i++){
                let div=document.createElement('div');
                    div.classList.add('card-details-size');
                    if(i==0){div.classList.add('card-details-size_active')};
                    div.innerHTML=`<p class="card-details-size__p">${product.size[i]} мл</p>
                    <p class="card-details-size-price__p">${product.price[i]} руб.</p> `;
                    (document.querySelector('.card-details-sizes__div') as Node).appendChild(div);
                    
            }    

            }
        })
        if(document.querySelector('main').innerHTML==''){
            document.querySelector('body').style.visibility='hidden';
            document.querySelector('body').classList.add('page-not-found')
        }
        
    }

    addCardEvents(){
        document.querySelector('.card-details-mini-images__div')?.addEventListener('click', (e)=>{
            let target=e.target as HTMLImageElement;
            if(target.classList.contains('card-details__mini-img')){
                (document.querySelector('.card-details__img') as HTMLImageElement).src=target.src;
            }
        });
       
    }
}
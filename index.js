(function(){
  const e = React, r = ReactDOM, {useState,useEffect,useRef} = e;

  // Sample products (could be replaced by backend data)
  const SAMPLE = [
    {id:'p1',title:'Core Performance Tee',price:29,colors:['Black','Gray'],sizes:['S','M','L'],images:[
      'https://images.unsplash.com/photo-1598970434795-0c54fe7c0642?auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=60'
    ],desc:'Breathable training tee made for daily workouts.'},
    {id:'p2',title:'Flex Leggings',price:49,colors:['Black','Navy'],sizes:['S','M','L'],images:[
      'https://images.unsplash.com/photo-1600180758890-1c2f7bb2d5f7?auto=format&fit=crop&w=800&q=60'
    ],desc:'High-waist leggings with 4-way stretch.'},
    {id:'p3',title:'Trainer Hoodie',price:69,colors:['Black','Olive'],sizes:['M','L'],images:[
      'https://images.unsplash.com/photo-1547572673-33e7b213de61?auto=format&fit=crop&w=800&q=60'
    ],desc:'Comfortable hoodie for warmups and cool downs.'}
  ];

  // Helpers
  const ls = (k,v)=>{try{if(arguments.length>1) localStorage.setItem(k,JSON.stringify(v)); else return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};

  function Header({onOpenCart,count,onSearch}){
    const [q,setQ]=useState('');
    useEffect(()=>onSearch && onSearch(q),[q]);
    return e.createElement('header',{className:'header'},
      e.createElement('div',{className:'brand'},'Honor Culture'),
      e.createElement('div',{className:'search'},
        e.createElement('input',{placeholder:'Search products, e.g. leggings',value:q,onChange:(ev)=>setQ(ev.target.value)})
      ),
      e.createElement('div',{className:'nav'},
        e.createElement('button',{className:'icon-btn',onClick:onOpenCart},
          e.createElement('span',{className:'cart-badge'},count||0),' 🛒'
        )
      )
    )
  }

  function ProductCard({p,onView,onAdd}){
    return e.createElement('div',{className:'card'},
      e.createElement('div',{className:'product-img',style:{backgroundImage:`url(${p.images[0]})`}}),
      e.createElement('div',{className:'p-title'},p.title),
      e.createElement('div',{className:'p-price'},`$${p.price}`),
      e.createElement('button',{className:'add-btn',onClick:()=>onAdd(p)},'Add to cart'),
      e.createElement('button',{className:'icon-btn',style:{marginTop:8},onClick:()=>onView(p)},'View')
    )
  }

  function ProductModal({product,onClose,onAdd}){
    const [idx,setIdx]=useState(0);
    if(!product) return null;
    return e.createElement('div',{className:'modal-backdrop',onClick:()=>onClose()},
      e.createElement('div',{className:'modal',onClick:(ev)=>ev.stopPropagation()},
        e.createElement('div',{className:'modal-grid'},
          e.createElement('div',null,
            e.createElement('div',{className:'product-img',style:{height:320,backgroundImage:`url(${product.images[idx]})`}}),
            e.createElement('div',{style:{display:'flex',gap:8,marginTop:8}},
              product.images.map((src,i)=>e.createElement('div',{key:i,className:'img-thumb'+(i===idx?' active':''),style:{backgroundImage:`url(${src})`},onClick:()=>setIdx(i)}))
            )
          ),
          e.createElement('div',null,
            e.createElement('h2',null,product.title),
            e.createElement('p',null,product.desc),
            e.createElement('div',null,e.createElement('strong',null,'$'+product.price)),
            e.createElement('div',{style:{marginTop:12}},
              e.createElement('button',{className:'add-btn',onClick:()=>{onAdd(product); onClose()}},'Add to cart')
            )
          )
        )
      )
    )
  }

  function CartDrawer({open,items,onClose,updateQty,onCheckout}){
    const total = items.reduce((s,i)=>s+i.price*i.qty,0);
    return e.createElement('div',{className:'drawer '+(open?'open':'')},
      e.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
        e.createElement('h3',null,'Your Cart'),
        e.createElement('button',{onClick:onClose},'Close')
      ),
      e.createElement('div',null,
        items.length===0?e.createElement('p',null,'Cart is empty'):
        items.map(it=>e.createElement('div',{key:it.id,className:'cart-item'},
          e.createElement('div',{style:{flex:1}},
            e.createElement('div',null,it.title),
            e.createElement('div',null,'$'+it.price+' x '+it.qty)
          ),
          e.createElement('div',null,
            e.createElement('div',{className:'qty'},
              e.createElement('button',{onClick:()=>updateQty(it.id,Math.max(0,it.qty-1))},'-'),
              e.createElement('div',null,it.qty),
              e.createElement('button',{onClick:()=>updateQty(it.id,it.qty+1)},'+')
            )
          )
        ))
      ),
      e.createElement('div',{style:{marginTop:12}},
        e.createElement('div',{style:{display:'flex',justifyContent:'space-between'}},e.createElement('strong',null,'Total'),e.createElement('strong',null,'$'+total)),
        e.createElement('button',{className:'checkout-btn',onClick:()=>onCheckout(items)},'Checkout (Demo)')
      )
    )
  }

  function CheckoutDemo({items,onClose}){
    const [status,setStatus]=useState(null);
    const [loading,setLoading]=useState(false);
    const [form,setForm]=useState({name:'',card:'',exp:'',cvv:''});
    const submit=()=>{
      setLoading(true);setTimeout(()=>{
        const ok = Math.random()>0.15; // small chance to fail
        setStatus(ok?'success':'error');setLoading(false);
        if(ok) localStorage.removeItem('hc_cart');
      },900);
    }
    return e.createElement('div',{className:'modal-backdrop',onClick:()=>onClose()},
      e.createElement('div',{className:'modal',onClick:(ev)=>ev.stopPropagation()},
        e.createElement('h3',null,'Demo Payment'),
        e.createElement('div',null,items.map(it=>e.createElement('div',null,it.title+' × '+it.qty+' — $'+(it.price*it.qty)))),
        e.createElement('div',{style:{marginTop:12}},
          e.createElement('input',{placeholder:'Name on card',value:form.name,onChange:(e)=>setForm({...form,name:e.target.value})}),
          e.createElement('input',{placeholder:'Card number',value:form.card,onChange:(e)=>setForm({...form,card:e.target.value})}),
          e.createElement('div',null, e.createElement('input',{placeholder:'MM/YY',value:form.exp,onChange:(e)=>setForm({...form,exp:e.target.value})}), e.createElement('input',{placeholder:'CVV',value:form.cvv,onChange:(e)=>setForm({...form,cvv:e.target.value})})),
          e.createElement('button',{className:'checkout-btn',onClick:submit,disabled:loading}, loading? 'Processing...' : 'Pay (Demo)')
        ),
        status && e.createElement('div',{style:{marginTop:12,color:status==='success'?'green':'red'}}, status==='success'?'Payment Successful (demo)':'Payment Failed (demo)')
      )
    )
  }

  function AdminFooter({onAddProduct,onOpen}){
    const [show,setShow]=useState(false);
    const [user,setUser]=useState('');
    const [pwd,setPwd]=useState('');
    const login=()=>{
      if(user==='admin'&&pwd==='admin'){setShow(true);onOpen && onOpen(true)} else alert('Invalid credentials (demo): use admin/admin')
    }
    return e.createElement('div',{className:'footer'},
      e.createElement('div',{className:'admin-login'},
        e.createElement('input',{placeholder:'Admin',value:user,onChange:(e)=>setUser(e.target.value)}),
        e.createElement('input',{placeholder:'Password',type:'password',value:pwd,onChange:(e)=>setPwd(e.target.value)}),
        e.createElement('button',{onClick:login},'Login')
      ),
      show && e.createElement('div',{className:'admin-panel'},
        e.createElement('h4',null,'Admin Panel (Demo)'),
        e.createElement('button',{onClick:()=>onAddProduct()},'Add sample product')
      )
    )
  }

  function App(){
    const [products,setProducts]=useState(()=>ls('hc_products')||SAMPLE);
    const [cart,setCart]=useState(()=>ls('hc_cart')||[]);
    const [query,setQuery]=useState('');
    const [modalProd,setModalProd]=useState(null);
    const [drawerOpen,setDrawerOpen]=useState(false);
    const [checkoutItems,setCheckoutItems]=useState(null);

    useEffect(()=>ls('hc_products',products),[products]);
    useEffect(()=>ls('hc_cart',cart),[cart]);

    const visible = products.filter(p=>p.title.toLowerCase().includes(query.toLowerCase())||p.desc.toLowerCase().includes(query.toLowerCase()));

    const addToCart = (p)=>{
      setCart(prev=>{
        const existing = prev.find(it=>it.id===p.id);
        if(existing) return prev.map(it=>it.id===p.id?{...it,qty:it.qty+1}:it);
        return [...prev,{...p,qty:1}];
      });
    }
    const updateQty = (id,qty)=>{
      setCart(prev=>{
        const next = prev.map(it=>it.id===id?{...it,qty}:it).filter(it=>it.qty>0);
        return next;
      })
    }
    const openCheckout = (items)=>{ setCheckoutItems(items); }
    const addSample = ()=>{
      const np = {id:'p'+(Date.now()),title:'New Product '+Math.floor(Math.random()*99),price:39,images:['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=60'],desc:'Added from admin (demo)'};
      setProducts(prev=>[np,...prev]);
      alert('Product added (demo)')
    }

    return e.createElement('div',null,
      e.createElement(Header,{onOpenCart:()=>setDrawerOpen(true),count:cart.reduce((s,i)=>s+i.qty,0),onSearch:setQuery}),
      e.createElement('main',{className:'container'},
        e.createElement('section',{style:{marginBottom:12}},
          e.createElement('h2',null,'Featured'),
          e.createElement('div',{className:'grid'}, visible.map(p=>e.createElement(ProductCard,{key:p.id,p:p,onView:()=>setModalProd(p),onAdd:()=>addToCart(p)})))
        ),
        e.createElement(AdminFooter,{onAddProduct:addSample,onOpen:()=>{}})
      ),
      e.createElement(ProductModal,{product:modalProd,onClose:()=>setModalProd(null),onAdd:addToCart}),
      e.createElement(CartDrawer,{open:drawerOpen,items:cart,onClose:()=>setDrawerOpen(false),updateQty:updateQty,onCheckout:openCheckout}),
      checkoutItems && e.createElement(CheckoutDemo,{items:checkoutItems,onClose:()=>setCheckoutItems(null)})
    )
  }

  // Mount
  document.addEventListener('DOMContentLoaded',function(){
    const root = document.getElementById('root');
    if(!root){console.error('No root element');return}
    r.render(e.createElement(App,null), root);
  });

})();

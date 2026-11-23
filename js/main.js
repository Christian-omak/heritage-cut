const $=s=>document.querySelector(s);

$('#mq').innerHTML=('Fades<span>✂</span>Tapers<span>✂</span>Beard sculpting<span>✂</span>Hot towel finish<span>✂</span>').repeat(8);

addEventListener('load',()=>setTimeout(()=>{
  $('#ld').classList.add('go');
  document.body.classList.add('go')
},1300));

addEventListener('scroll',()=>$('#nav').classList.toggle('s',scrollY>60),{passive:true});

const io=new IntersectionObserver(e=>e.forEach(x=>{
  if(x.isIntersecting){
    x.target.classList.add('in');
    io.unobserve(x.target);
    x.target.querySelectorAll('[data-n]').forEach(count)
  }
}),{threshold:.15});

document.querySelectorAll('.rv').forEach((el,i)=>{
  el.style.transitionDelay=(el.classList.contains('card')||el.classList.contains('rev')?(i%3)*.12:0)+'s';
  io.observe(el)
});

function count(el){
  const t=+el.dataset.n,d=t%1?1:0,s=performance.now();
  (function f(n){
    const p=Math.min((n-s)/1600,1);
    el.textContent=(t*(1-Math.pow(1-p,3))).toFixed(d);
    if(p<1)requestAnimationFrame(f)
  })(s)
}

const RV=[
  ['Hands down one of the best barber shops around. Every visit you get a fresh, clean, perfect cut.','Seba Joe Salloum'],
  ['The barbers are true masters of their craft, with great attention to detail and an eye for what suits you.','Paul King'],
  ['Amazing service and professional work. Friendly barber, clean shop, great atmosphere.','Mikel Tohme']
];

let ri=0,rt;
const rot=$('#rot');

function showR(i){
  ri=i;
  rot.classList.add('sw');
  setTimeout(()=>{
    $('#rq').textContent=RV[i][0];
    $('#rn').textContent=RV[i][1];
    [...$('#rd').children].forEach((d,j)=>d.classList.toggle('on',j==i));
    rot.classList.remove('sw')
  },400)
}

RV.forEach((_,i)=>{
  const d=document.createElement('i');
  d.onclick=()=>{
    showR(i);
    clearInterval(rt);
    rt=setInterval(()=>showR((ri+1)%RV.length),6000)
  };
  $('#rd').appendChild(d)
});

$('#rq').textContent=RV[0][0];
$('#rn').textContent=RV[0][1];
$('#rd').children[0].classList.add('on');
rt=setInterval(()=>showR((ri+1)%RV.length),6000);


/* BOOKING SYSTEM */

const S={b:'',s:'',t:''};

const BA=['Maher','Najem','Nayef','Any barber'];
const SV=['Signature Haircut','Fade or Taper','Beard Sculpting','Cut and Beard'];

function chips(id,arr,k){
  const box=$(id);

  arr.forEach(v=>{
    const b=document.createElement('button');
    b.type='button';
    b.textContent=v;

    b.onclick=()=>{
      S[k]=v;
      [...box.children].forEach(c=>c.classList.toggle('on',c===b));
      sum()
    };

    box.appendChild(b)
  })
}

chips('#cb',BA,'b');
chips('#cs',SV,'s');

const bd=$('#bd');
const pad=n=>String(n).padStart(2,'0');
const now=new Date();

const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());

bd.min=iso(now);
bd.value=iso(now);

function slots(){
  const box=$('#ct');
  box.innerHTML='';
  S.t='';

  const today=bd.value===iso(new Date());
  const n=new Date();

  for(let m=600;m<=1170;m+=30){
    const b=document.createElement('button');
    b.type='button';

    const h=Math.floor(m/60),mi=m%60;
    b.textContent=pad(h)+':'+pad(mi);

    if(today&&m<=n.getHours()*60+n.getMinutes()+15){
      b.disabled=true
    }

    b.onclick=()=>{
      S.t=b.textContent;
      [...box.children].forEach(c=>c.classList.toggle('on',c===b));
      sum()
    };

    box.appendChild(b)
  }

  sum()
}

bd.onchange=slots;
slots();

function sum(){
  const d=bd.value
    ?new Date(bd.value+'T00:00').toLocaleDateString('en-GB',{
      weekday:'long',
      day:'numeric',
      month:'long'
    })
    :'';

  $('#bm').textContent=(S.b&&S.s&&S.t&&d)
    ?S.s+' with '+S.b+', '+d+' at '+S.t
    :'Pick a barber, service, date and time.'
}


/* SUBMIT BOOKING */

$('#bg').onclick=async()=>{
  const n=$('#bn').value.trim();
  const p=$('#bp').value.trim();
  const btn=$('#bg');
  const message=$('#bm');

  if(!(S.b&&S.s&&S.t&&bd.value)){
    message.textContent='Please choose a barber, service, date and time first.';
    return
  }

  if(!n||p.length<6){
    message.textContent='Please add your name and phone number.';
    return
  }

  if(!window.supabaseClient){
    message.textContent='Connection error. Please try again later.';
    return
  }

  btn.disabled=true;
  btn.textContent='Submitting...';

  try{
    const {error}=await window.supabaseClient
      .from('bookings')
      .insert({
        customer_name:n,
        phone:p,
        barber:S.b,
        service:S.s,
        appointment_date:bd.value,
        appointment_time:S.t,
        status:'Pending'
      });

    if(error)throw error;

    message.innerHTML=
      '<strong>Booking request received!</strong><br>'+
      'Thank you! Your appointment request has been submitted. '+
      'We will contact you shortly to confirm your appointment.';

    $('#bn').value='';
    $('#bp').value='';

    S.b='';
    S.s='';
    S.t='';

    document.querySelectorAll('#cb button, #cs button, #ct button')
      .forEach(b=>b.classList.remove('on'));

    sum();

    message.innerHTML=
      '<strong>Booking request received!</strong><br>'+
      'Thank you! Your appointment request has been submitted. '+
      'We will contact you shortly to confirm your appointment.';

  }catch(error){
    console.error('Booking error:',error);
    message.textContent='Could not save your booking. Please try again.';
  }

  btn.disabled=false;
  btn.textContent='Send booking request';
};


/* POINTER EFFECTS */

addEventListener('pointermove',e=>{
  $('#cur').style.transform=`translate(${e.clientX}px,${e.clientY}px)`
});


/* EXTRA MOTION */

document.querySelectorAll('h2').forEach(h=>{
  let k=0;

  h.innerHTML=h.innerHTML.replace(/(<[^>]+>)|([^<\s]+)/g,(m,t,w)=>
    t?t:'<w><i style="transition-delay:'+(k++*.07)+'s">'+w+'</i></w> '
  )
});

addEventListener('scroll',()=>{
  const y=scrollY;
  const m=document.documentElement.scrollHeight-innerHeight;

  $('#pg').style.transform='scaleX('+(m>0?y/m:0)+')';

  const h=$('.hero h1');

  if(y<innerHeight){
    h.style.transform='translateY('+y*.22+'px)';
    $('.hero .row').style.opacity=1-y/(innerHeight*.7)
  }
},{passive:true});

document.querySelectorAll('.btn').forEach(b=>{
  b.addEventListener('pointermove',e=>{
    const r=b.getBoundingClientRect();

    b.style.transform='translate('+
      (e.clientX-r.left-r.width/2)*.2+'px,'+
      (e.clientY-r.top-r.height/2)*.3+'px)'
  });

  b.addEventListener('pointerleave',()=>b.style.transform='')
});

document.querySelectorAll('.card').forEach(c=>{
  c.addEventListener('pointermove',e=>{
    const r=c.getBoundingClientRect();

    c.style.setProperty('--tx',((e.clientX-r.left)/r.width-.5)*-24+'px');
    c.style.setProperty('--ty',((e.clientY-r.top)/r.height-.5)*-24+'px')
  });

  c.addEventListener('pointerleave',()=>{
    c.style.setProperty('--tx','0px');
    c.style.setProperty('--ty','0px')
  })
});


/* PARTICLE EFFECT */

if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
  const cv=document.createElement('canvas');
  cv.id='dust';
  document.body.appendChild(cv);

  const cx=cv.getContext('2d'),P=[];
  let W,H;

  const rs=()=>{
    W=cv.width=innerWidth;
    H=cv.height=innerHeight
  };

  rs();
  addEventListener('resize',rs);

  for(let i=0;i<45;i++){
    P.push({
      x:Math.random()*W,
      y:Math.random()*H,
      r:Math.random()*1.8+.4,
      v:Math.random()*.35+.1,
      a:Math.random()*.5+.15,
      p:Math.random()*6
    })
  }

  (function dr(t){
    cx.clearRect(0,0,W,H);

    P.forEach(q=>{
      q.y-=q.v;
      q.x+=Math.sin(t/1500+q.p)*.3;

      if(q.y<-5){
        q.y=H+5;
        q.x=Math.random()*W
      }

      cx.beginPath();
      cx.arc(q.x,q.y,q.r,0,7);
      cx.fillStyle='rgba(201,163,91,'+q.a+')';
      cx.fill()
    });

    requestAnimationFrame(dr)
  })(0)
}


/* RIBBON MOTION */

(()=>{
  const m=document.querySelector('.mq');
  const rb=document.querySelector('.ribbon');

  let ly=scrollY,sk=0;

  (function f(){
    const v=scrollY-ly;
    ly=scrollY;

    sk+=(Math.max(-8,Math.min(8,v*.25))-sk)*.1;

    m.style.transform='skewX('+(-sk).toFixed(2)+'deg)';

    requestAnimationFrame(f)
  })();

  addEventListener('pointermove',e=>{
    rb.style.transform='translateX('+((e.clientX/innerWidth-.5)*-26).toFixed(1)+'px)'
  })
})();

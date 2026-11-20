const program=body=>`fn main() {\n${body.split('\n').map(l=>'    '+l).join('\n')}\n}`;
const b=(name,value,status='owned',target='')=>({name,value,status,target});
const h=(id,value,alive=true)=>({id,value,alive});
const f=(line,title,body,bindings=[],heap=[],output='')=>({line,title,body,bindings,heap,output});
export const examples=[
 {id:'move',group:'ownership',name:'Move a String',summary:'Transfer ownership without copying the heap allocation.',code:program('let original = String::from("hello");\nlet next = original;\nprintln!("{next}");'),output:'hello\n',frames:[
 f(2,'One value, one owner','The String binding owns a heap allocation. This is a conceptual memory view, not a measured address.',[b('original','String','owned','A')],[h('A','hello')]),
 f(3,'Ownership changes hands','Moving a String makes the old binding unavailable. The string bytes do not need a deep copy.',[b('original','moved','moved'),b('next','String','owned','A')],[h('A','hello')]),
 f(4,'Use the current owner','Formatting borrows next temporarily. The binding still owns its String.',[b('original','moved','moved'),b('next','String','owned','A')],[h('A','hello')],'hello\n'),
 f(5,'The owner leaves scope','Dropping next releases its allocation. The moved-from original does not free it again.',[b('original','moved','moved'),b('next','dropped','dropped')],[h('A','hello',false)],'hello\n')]},
 {id:'clone',group:'ownership',name:'Clone a String',summary:'Make a deliberate independent copy.',code:program('let original = String::from("hello");\nlet mut copy = original.clone();\ncopy.push_str(" Rust");\nprintln!("{original} | {copy}");'),output:'hello | hello Rust\n',frames:[
 f(2,'Start with one allocation','original owns the string data.',[b('original','String','owned','A')],[h('A','hello')]),
 f(3,'Clone creates independent data','String::clone copies its bytes into a separate owned allocation.',[b('original','String','owned','A'),b('copy','String','owned','B')],[h('A','hello'),h('B','hello')]),
 f(4,'Change only the clone','Appending may reallocate the clone; the original stays unchanged. A and B are symbolic allocation labels.',[b('original','String','owned','A'),b('copy','String','owned','B')],[h('A','hello'),h('B','hello Rust')]),
 f(5,'Both bindings remain usable','Each String owns its own data and will be dropped independently.',[b('original','String','owned','A'),b('copy','String','owned','B')],[h('A','hello'),h('B','hello Rust')],'hello | hello Rust\n')]},
 {id:'copy',group:'ownership',name:'Copy an integer',summary:'Copy types leave the original usable after assignment.',code:program('let original = 7;\nlet mut next = original;\nnext += 1;\nprintln!("{original} | {next}");'),output:'7 | 8\n',frames:[
 f(2,'An integer value','i32 implements Copy. This conceptual view stores the value directly in its binding.',[b('original','7')]),
 f(3,'Assignment copies the value','Both bindings remain valid. There is no String heap allocation to share.',[b('original','7'),b('next','7')]),
 f(4,'Mutate the second value','Updating next does not change original.',[b('original','7'),b('next','8')]),
 f(5,'Read both bindings','Copy is a type property, not a special behavior of this variable name.',[b('original','7'),b('next','8')],[],'7 | 8\n')]},
 {id:'use-after-move',group:'ownership',name:'Use after move',summary:'See why reading a moved String is rejected.',error:'E0382',diagnostic:'borrow of moved value: original',code:program('let original = String::from("hello");\nlet next = original;\nprintln!("{original} | {next}");'),frames:[
 f(2,'Analyze the owner','The compiler tracks original as the owner. Rejected programs do not execute these visual states.',[b('original','String','owned','A')],[h('A','hello')]),
 f(3,'Analyze the move','Ownership transfers to next. original is no longer initialized for use.',[b('original','moved','moved'),b('next','String','owned','A')],[h('A','hello')]),
 f(4,'Reject the old binding','The compiler reports E0382 before producing a runnable program. Use next, borrow earlier, or explicitly clone.',[b('original','invalid use','error'),b('next','String','owned','A')],[h('A','hello')])]},
 {id:'shared',group:'borrowing',name:'Shared references',summary:'Read the same value through multiple shared borrows.',code:program('let text = String::from("Rust");\nlet first = &text;\nlet second = &text;\nprintln!("{first} | {second}");'),output:'Rust | Rust\n',frames:[
 f(2,'An owned String','text owns the value throughout this example.',[b('text','String','owned','A')],[h('A','Rust')]),
 f(3,'A shared borrow','first provides shared access. It does not take ownership of the string.',[b('text','String','owned','A'),b('first','&String','shared','A')],[h('A','Rust')]),
 f(4,'Another shared borrow','Multiple shared borrows can overlap. These references do not permit push_str.',[b('text','String','owned','A'),b('first','&String','shared','A'),b('second','&String','shared','A')],[h('A','Rust')]),
 f(5,'Read through both','Both references are used here. The owner remains responsible for dropping the String.',[b('text','String','owned','A'),b('first','&String','shared','A'),b('second','&String','shared','A')],[h('A','Rust')],'Rust | Rust\n')]},
 {id:'mutable',group:'borrowing',name:'An exclusive borrow',summary:'Temporarily grant one reference permission to mutate.',code:program('let mut text = String::from("Rust");\nlet edit = &mut text;\nedit.push_str("!");\nprintln!("{text}");'),output:'Rust!\n',frames:[
 f(2,'A mutable binding','mut permits borrowing this binding mutably.',[b('text','String','owned','A')],[h('A','Rust')]),
 f(3,'Exclusive access','edit temporarily has exclusive access. Conflicting uses of text are restricted while the borrow is needed.',[b('text','lent out','suspended','A'),b('edit','&mut String','exclusive','A')],[h('A','Rust')]),
 f(4,'Mutate through the borrow','push_str changes the owned value through edit. This is the last use of edit.',[b('text','lent out','suspended','A'),b('edit','&mut String','exclusive','A')],[h('A','Rust!')]),
 f(5,'Use the owner again','The borrow is no longer needed after its last use, even though the binding remains in lexical scope.',[b('text','String','owned','A'),b('edit','last use ended','ended')],[h('A','Rust!')],'Rust!\n')]},
 {id:'conflict',group:'borrowing',name:'Overlapping borrows',summary:'Understand why shared access conflicts with an exclusive borrow.',error:'E0502',diagnostic:'cannot borrow text as mutable because it is also borrowed as immutable',code:program('let mut text = String::from("Rust");\nlet view = &text;\nlet edit = &mut text;\nedit.push_str("!");\nprintln!("{view}");'),frames:[
 f(2,'Start with an owner','We are tracing compile-time reasoning, not running this rejected program.',[b('text','String','owned','A')],[h('A','Rust')]),
 f(3,'A shared reference is still needed','view is read by a later println, so the shared borrow must remain valid until that use.',[b('text','String','owned','A'),b('view','&String','shared','A')],[h('A','Rust')]),
 f(4,'A conflicting exclusive borrow','An overlapping mutable borrow would violate shared access. The compiler reports E0502.',[b('text','String','owned','A'),b('view','&String','shared','A'),b('edit','conflict','error','A')],[h('A','Rust')])]},
 {id:'last-use',group:'borrowing',name:'End a borrow at last use',summary:'Reorder the last read so the next exclusive borrow can begin.',code:program('let mut text = String::from("Rust");\nlet view = &text;\nprintln!("{view}");\nlet edit = &mut text;\nedit.push_str("!");\nprintln!("{text}");'),output:'Rust\nRust!\n',frames:[
 f(3,'Borrow to read','view borrows the existing String.',[b('text','String','owned','A'),b('view','&String','shared','A')],[h('A','Rust')]),
 f(4,'Finish the last shared use','After this read, view is not needed again. Its borrow can end here.',[b('text','String','owned','A'),b('view','last use ended','ended')],[h('A','Rust')],'Rust\n'),
 f(5,'Start an exclusive borrow','The old shared borrow no longer conflicts. This is an example of non-lexical lifetimes.',[b('text','lent out','suspended','A'),b('edit','&mut String','exclusive','A')],[h('A','Rust')],'Rust\n'),
 f(7,'Observe the mutation','After the mutable borrow’s last use, text can be read directly.',[b('text','String','owned','A'),b('edit','last use ended','ended')],[h('A','Rust!')],'Rust\nRust!\n')]},
 {id:'valid-scope',group:'lifetimes',name:'Owner outlives the borrow',summary:'A reference stays valid for every use because its owner is still alive.',code:program('let text = String::from("long lived");\n{\n    let view = &text;\n    println!("{view}");\n}\nprintln!("{text}");'),output:'long lived\nlong lived\n',frames:[
 f(2,'An outer owner','text is declared outside the nested block.',[b('text','outer scope','owned','A')],[h('A','long lived')]),
 f(4,'Borrow inside the block','The owner is still alive throughout the reference’s uses.',[b('text','outer scope','owned','A'),b('view','inner scope','shared','A')],[h('A','long lived')]),
 f(5,'Read the reference','The allocation remains valid.',[b('text','outer scope','owned','A'),b('view','inner scope','shared','A')],[h('A','long lived')],'long lived\n'),
 f(7,'End the borrow, keep the owner','Leaving the inner scope ends view. text remains usable in the outer scope.',[b('text','outer scope','owned','A'),b('view','scope ended','ended')],[h('A','long lived')],'long lived\nlong lived\n')]},
 {id:'dangling',group:'lifetimes',name:'A dangling reference',summary:'A reference cannot be used after its owner is dropped.',error:'E0597',diagnostic:'text does not live long enough',code:program('let view;\n{\n    let text = String::from("short lived");\n    view = &text;\n}\nprintln!("{view}");'),frames:[
 f(4,'An inner owner','The String would be owned by a binding inside the nested block. The trace illustrates why compilation is rejected.',[b('text','inner scope','owned','A')],[h('A','short lived')]),
 f(5,'A reference escapes the block','view points to data whose owner has a shorter scope than its later use.',[b('text','inner scope','owned','A'),b('view','outer scope','shared','A')],[h('A','short lived')]),
 f(7,'Reject the dangling use','The owner would be dropped before this read. E0597 prevents executing a dangling reference. An annotation cannot keep the String alive.',[b('text','scope ended','dropped'),b('view','invalid reference','error','A')],[h('A','short lived',false)])]},
 {id:'return-owned',group:'lifetimes',name:'Return an owned value',summary:'Transfer ownership out of a function instead of borrowing its local data.',code:'fn make_message() -> String {\n    String::from("hello from Rust")\n}\n\nfn main() {\n    let message = make_message();\n    println!("{message}");\n}',output:'hello from Rust\n',frames:[
 f(2,'Construct an owned result','The function creates a String and returns it by value.',[b('return value','String','owned','A')],[h('A','hello from Rust')]),
 f(6,'Transfer ownership to the caller','message receives ownership. It does not borrow a local binding that has gone out of scope.',[b('message','String','owned','A')],[h('A','hello from Rust')]),
 f(7,'Use the owned result','The caller controls the returned String’s lifetime.',[b('message','String','owned','A')],[h('A','hello from Rust')],'hello from Rust\n'),
 f(8,'Drop at the caller’s scope end','The allocation is released when message is dropped.',[b('message','dropped','dropped')],[h('A','hello from Rust',false)],'hello from Rust\n')]}
];
export function iteratorExperiment(text='1, 2, 3, 4, 5, 6',filter='even',map='double',consumer='collect'){
 if(!['even','positive','all'].includes(filter)||!['double','square','increment'].includes(map)||!['collect','sum'].includes(consumer))throw Error('Choose an available pipeline operation.');
 const parts=text.trim()?text.split(',').map(s=>s.trim()):[];
 if(parts.length>24||parts.some(s=>!/^[-+]?\d+$/.test(s)||Math.abs(Number(s))>1000))throw Error('Enter up to 24 comma-separated integers between −1000 and 1000.');
 const input=parts.map(Number),filtered=input.filter(n=>filter==='even'?n%2===0:filter==='positive'?n>0:true),mapped=filtered.map(n=>map==='double'?n*2:map==='square'?n*n:n+1),result=consumer==='sum'?mapped.reduce((a,b)=>a+b,0):mapped;
 const predicate={even:'|x| x % 2 == 0',positive:'|x| *x > 0',all:'|_| true'}[filter],transform={double:'|x| x * 2',square:'|x| x * x',increment:'|x| x + 1'}[map];
 const code=program(`let values: Vec<i32> = vec![${input.join(', ')}];\nlet result: ${consumer==='sum'?'i32':'Vec<i32>'} = values.into_iter()\n    .filter(${predicate})\n    .map(${transform})\n    .${consumer==='sum'?'sum()':'collect()'};\nprintln!("{result:?}");`);
 return{input,filtered,mapped,result,code,output:(Array.isArray(result)?'['+result.join(', ')+']':String(result))+'\n'};
}
export const playgroundURL=code=>'https://play.rust-lang.org/?version=stable&mode=debug&edition=2024&code='+encodeURIComponent(code);

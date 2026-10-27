export function day(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function elapsed(a:{elapsed:number;start:number|null}|null,now:number){return a?Math.max(0,a.elapsed+(a.start!==null?(now-a.start)/1000:0)):0;}
export function streakFor(totals:Record<string,number>,goals:Record<string,number>,goal:number,now=new Date()){
 let streak=0;const d=new Date(now);if((totals[day(d)]||0)<(goals[day(d)]||goal)*60)d.setDate(d.getDate()-1);
 for(let i=0;i<3650;i++){if((totals[day(d)]||0)<(goals[day(d)]||goal)*60)break;streak++;d.setDate(d.getDate()-1)}return streak;
}

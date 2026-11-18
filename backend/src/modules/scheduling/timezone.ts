import { BadRequestException } from '@nestjs/common';

export interface LocalDateTime { year:number;month:number;day:number;hour:number;minute:number;second:number;weekday:number; }
export function assertTimezone(zone:string):void { try { new Intl.DateTimeFormat('en-US',{timeZone:zone}).format(new Date()); } catch { throw new BadRequestException(`Unknown timezone: ${zone}`); } }
export function localParts(at:Date,zone:string):LocalDateTime {
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(at);
  const get=(type:Intl.DateTimeFormatPartTypes)=>Number(parts.find(p=>p.type===type)?.value);
  const year=get('year'),month=get('month'),day=get('day');
  return {year,month,day,hour:get('hour'),minute:get('minute'),second:get('second'),weekday:new Date(Date.UTC(year,month-1,day)).getUTCDay()};
}
export function localDateTimeToUtc(date:string,time:string,zone:string):Date {
  assertTimezone(zone);
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date);const tm=/^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time);
  if(!match||!tm)throw new BadRequestException('Invalid local date or time');
  const [,ys,ms,ds]=match;const [,hs,mins,secs='00']=tm;const wall=Date.UTC(Number(ys),Number(ms)-1,Number(ds),Number(hs),Number(mins),Number(secs));let guess=wall;
  for(let i=0;i<5;i++){const local=localParts(new Date(guess),zone);const represented=Date.UTC(local.year,local.month-1,local.day,local.hour,local.minute,local.second);const delta=wall-represented;if(delta===0)return new Date(guess);guess+=delta;}
  const result=localParts(new Date(guess),zone);if(result.year!==Number(ys)||result.month!==Number(ms)||result.day!==Number(ds)||result.hour!==Number(hs)||result.minute!==Number(mins))throw new BadRequestException('Local time does not exist in the selected timezone');return new Date(guess);
}
export function dateOnly(at:Date,zone:string):string { const p=localParts(at,zone);return `${p.year.toString().padStart(4,'0')}-${p.month.toString().padStart(2,'0')}-${p.day.toString().padStart(2,'0')}`; }
export function addDays(date:string,count:number):string {const [y,m,d]=date.split('-').map(Number);const x=new Date(Date.UTC(y!,m!-1,d!+count));return `${x.getUTCFullYear().toString().padStart(4,'0')}-${(x.getUTCMonth()+1).toString().padStart(2,'0')}-${x.getUTCDate().toString().padStart(2,'0')}`;}
export function weekday(date:string):number {const [y,m,d]=date.split('-').map(Number);return new Date(Date.UTC(y!,m!-1,d!)).getUTCDay();}
export function intervalOverlaps(aStart:Date,aEnd:Date,bStart:Date,bEnd:Date):boolean{return aStart.getTime()<bEnd.getTime()&&aEnd.getTime()>bStart.getTime();}

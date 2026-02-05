// TODO: Add generic types here
export default function filterRawSqlData(data: any[]){
   return data.filter(item => typeof item === 'object');
}
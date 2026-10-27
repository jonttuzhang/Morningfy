import {getSupabase} from './supabase-client';
export async function emailStateRequest(_url:string,init?:RequestInit):Promise<Response>{
 const client=getSupabase();
 const {data:{session},error:authError}=await client.auth.getSession();
 if(authError||!session)return Response.json({}, {status:401});
 if(init?.method==='POST'){
  const body=JSON.parse(String(init.body));
  const {data,error}=await client.rpc('save_morningfy_state',{payload:body.data,expected_revision:body.revision}).abortSignal(init.signal??new AbortController().signal);
  if(error)return Response.json({error:error.message},{status:error.code==='40001'?409:error.code==='23514'?413:error.code==='42501'?401:500});
  return Response.json({revision:data});
 }
 const {data,error}=await client.from('morningfy_state').select('data,revision').eq('user_id',session.user.id).maybeSingle();
 if(error)return Response.json({error:error.message},{status:500});
 return Response.json(data??{data:null,revision:0});
}

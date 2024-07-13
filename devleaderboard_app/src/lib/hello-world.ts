import { supabase } from './supabaseClient';

export const callHelloWorldFunction = async (name: string) => {
  const { data, error } = await supabase.functions.invoke('hello-world', {
    body: { name },
  });

  if (error) {
    console.error('Error calling hello-world function:', error);
    return null;
  }

  return data;
};
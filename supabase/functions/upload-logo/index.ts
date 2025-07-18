import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { cors } from 'hono/cors';

type Env = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('/upload-logo/*', cors({
  origin: '*',
  allowHeaders: ['authorization', 'x-client-info', 'apikey', 'content-type'],
  allowMethods: ['POST', 'OPTIONS'],
}));

app.post('/upload-logo', async (c) => {
  try {
    const supabaseClient = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: c.req.header('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('logo') as File;
    const tenantId = formData.get('tenantId') as string;

    if (!file || !tenantId) {
      return c.json({ error: 'Missing logo file or tenantId' }, 400);
    }

    const filePath = `${tenantId}/${Date.now()}-${file.name}`;

    const { data, error } = await supabaseClient.storage
      .from('logos')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabaseClient.storage.from('logos').getPublicUrl(data.path);

    await supabaseClient.from('tenants').update({ logo_url: publicUrl }).eq('id', tenantId);

    return c.json({ publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return c.json({ error: message }, 400);
  }
});

export default app;

# Publicar no Netlify com painel /admin
1. Crie um repositório PRIVADO no GitHub, envie esta pasta e conecte-o ao Netlify (Add new site > Import from Git).
2. Em admin/config.yml troque `repo:` por `usuario/repositorio`.
3. GitHub: Settings > Developer settings > OAuth Apps > New. Homepage = URL do site; Callback = https://api.netlify.com/auth/done
4. Netlify: Site configuration > Access & security > OAuth > Install provider > GitHub, com o Client ID e o Secret do passo 3.
5. Abra https://SEU-SITE/admin e entre com GitHub. Só quem tem permissão de escrita no repositório consegue entrar.
6. Ative autenticação em dois fatores em todas as contas GitHub com acesso e dê acesso apenas a quem precisa.
Testar localmente: `python3 -m http.server` na pasta (o site usa fetch, não abre por file://).
Trocar `decap-cms@^3.0.0` em admin/index.html por uma versão exata depois de conferir no npm.

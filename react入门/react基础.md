``` 

**  standard.js 规范 **
>
> 1. npm install standard --save-dev
> 2. npm install snazzy --save-dev
> 3. 配置package.json,添加一条名为 lint 的 npm script "scripts":
>    {"lint": "standard --verbose|snazzy"}
> 4. 使用编辑器插件，实时检查代码规范
> 5. git pre-commit钩子, 在每次commit之前检查代码规范
```
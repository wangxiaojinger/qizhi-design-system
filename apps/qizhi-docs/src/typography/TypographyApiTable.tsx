import { ApiTable, type ComponentApiName } from "../api/ApiTable";
import { typographyApi } from "./typographyApi";

export function TypographyApiTable() { return <section id="typography-API" className="qizhi-typography-api"><h2 className="qz-demo-title"><a tabIndex={-1} href="#typography-API">API</a></h2>{typographyApi.map((group) => <div key={group.title}><h3>{group.title}</h3><ApiTable api={`typographyApi:${group.title}` as ComponentApiName} label={`${group.title} API`} /></div>)}</section>; }

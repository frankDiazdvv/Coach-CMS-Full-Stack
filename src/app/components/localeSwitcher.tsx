import { useLocale } from "next-intl";

const LocaleSwitcher: React.FC = () => {

    const locale: string =  useLocale();

    return(
        <select name="localeSwitch" id="localeSwitch" defaultValue={locale}>
            <option value="en">English</option>
            <option value="es">Español</option>
        </select>
    );
}

export default LocaleSwitcher;
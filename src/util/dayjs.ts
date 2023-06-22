import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax'; // import plugin
import customParseFormat from 'dayjs/plugin/customParseFormat'; // import plugin
import utc from 'dayjs/plugin/utc'; // import plugin

dayjs.extend(minMax);
dayjs.extend(customParseFormat);
dayjs.extend(utc);

export default dayjs;

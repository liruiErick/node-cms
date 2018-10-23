'use strict';

import api from './api'
import manage from './manage'

export default app => {
    app.use('/api', api);
    app.use('/manage', manage);
}
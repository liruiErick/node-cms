'use strict';

import api from './api'
import manage from './manage'
import system from './system'

export default app => {
    app.use('/api', api);
    app.use('/manage', manage);
    app.use('/system', system);
}
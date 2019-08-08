import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { environment } from '../../../../environments/environment'


@Component({
  selector: 'ksp-copyright',
  templateUrl: './copyright.component.html',
  styleUrls: ['./copyright.component.less']
})
export class CopyrightComponent implements OnInit {
  version: string = environment.version

  constructor (public router: Router) {
  }

  ngOnInit () {
  }

}


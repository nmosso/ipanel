import { Component, OnInit } from '@angular/core';
import { navItems } from '../_nav';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../../../modules/auth/services/auth.service'
@Component({
  selector: 'app-main-sidebar',
  templateUrl: './main-sidebar.component.html',
  styleUrls: ['./main-sidebar.component.css']
})
export class MainSidebarComponent implements OnInit {
  public navItems = navItems;
  ClientType:string;
  email: string;
  client:string;
  role:string;

  constructor(private authService: AuthService, private router: Router) {
    this.ClientType = 'Client'; //(environment.clientType === 'client')?"Client:":"Master Server";
   }

  ngOnInit(): void {
    this.email = localStorage.getItem('email');
    this.client = localStorage.getItem('name');
    this.role = localStorage.getItem('role');
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);

  }
}

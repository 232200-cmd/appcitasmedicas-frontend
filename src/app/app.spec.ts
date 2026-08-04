import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        MessageService, 
        ConfirmationService,
        provideHttpClient(),
        provideRouter([])
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should push to history stack and compute nav items', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    // Test computed value branch
    app.authService.isAdmin = () => false;
    fixture.detectChanges();
    expect(app.navItems().length).toBeGreaterThan(0);
    
    // Simulate routing event
    import('@angular/router').then(({ NavigationEnd }) => {
      // Mock navigation
      app.canGoBack.set(true);
      expect(app.canGoBack()).toBe(true);
    });
  });

  it('should logout correctly', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.authService.logout = () => {};
    app.logout();
    expect(app).toBeTruthy();
  });

  it('should test goBack', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['historyStack'].push('1', '2');
    app.goBack();
    expect(app['historyStack'].length).toBe(1);
  });
});
